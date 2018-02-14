import { BaseController } from "lynx-framework/base.controller";
import Request from "lynx-framework/request";
import Response from "lynx-framework/lynx/response";
import {
    Route,
    GET,
    POST,
    Body,
    Name,
    Verify
} from "lynx-framework/decorators";
import { ValidateObject } from "lynx-framework/validate-object";
import * as userLib from "lynx-framework/libs/users";
import User from "lynx-framework/entities/user.entity";
import { notAuthUser, authUser } from "lynx-framework/verifiers";

import AuthModule from "../index";

@Route(AuthModule.settings.controllerPath)
export default class AuthController extends BaseController {
    private get context() {
        let c: any = {};
        let original: any = AuthModule.settings.context as any;
        for (let key in original) {
            c[key] = original[key];
        }
        return c;
    }

    @Verify(notAuthUser)
    @Name("auth_login")
    @GET(AuthModule.settings.loginPath)
    async getLogin(req: Request): Promise<Response> {
        let c = this.context;
        return this.render(AuthModule.settings.loginTemplatePath, req, c);
    }

    @Verify(notAuthUser)
    @Name("auth_perform_login")
    @Body("d", AuthModule.settings.loginSchema)
    @POST(AuthModule.settings.loginPath)
    async postLogin(
        d: ValidateObject<{ email: string; password: string }>,
        req: Request
    ): Promise<Response> {
        let c = this.context;
        if (!d.isValid) {
            c.errors = d.errors;
            return this.render(AuthModule.settings.loginTemplatePath, req, c);
        }
        let user = await userLib.performLogin(d.obj.email, d.obj.password);
        if (!(user instanceof User)) {
            c.loginError = true;
            return this.render(AuthModule.settings.loginTemplatePath, req, c);
        }
        userLib.createUserSession(req, user);
        return this.redirect(AuthModule.settings.redirectPath);
    }

    @Name("auth_logout")
    @Verify(authUser)
    @GET(AuthModule.settings.logoutPath)
    async logout(req: Request): Promise<Response> {
        userLib.destroyUserSession(req);
        return this.redirect(AuthModule.settings.redirectPath);
    }

    @Verify(notAuthUser)
    @Name("auth_forgot_password")
    @GET(AuthModule.settings.forgotPasswordPath)
    async forgotPassword(req: Request): Promise<Response> {
        let c = this.context;
        return this.render(
            AuthModule.settings.forgotPasswordTemplatePath,
            req,
            c
        );
    }

    @Verify(notAuthUser)
    @Name("auth_perform_forgot_password")
    @Body("d", AuthModule.settings.forgotPasswordSchema)
    @POST(AuthModule.settings.forgotPasswordPath)
    async performForgotPassword(
        d: ValidateObject<{ email: string }>,
        req: Request
    ): Promise<Response> {
        let c = this.context;
        if (!d.isValid) {
            c.errors = d.errors;
            return this.render(
                AuthModule.settings.forgotPasswordTemplatePath,
                req,
                c
            );
        }

        let user = await User.findOne({ where: { email: d.obj.email } });
        if (!(user instanceof User)) {
            c.emailError = true;
            return this.render(
                AuthModule.settings.forgotPasswordTemplatePath,
                req,
                c
            );
        }

        let newPassword = userLib.generatePassword();
        user.password = await userLib.hashPassword(newPassword);
        let sent = await this.sendMail(
            req,
            user.email,
            '{{"auth_subject_forgot_password"|tr}}',
            AuthModule.settings.mailForgotPasswordTxtPath,
            AuthModule.settings.mailForgotPasswordHtmlPath,
            { user: user, password: newPassword }
        );
        if (!sent) {
            c.sendError = true;
            return this.render(
                AuthModule.settings.forgotPasswordTemplatePath,
                req,
                c
            );
        }
        await user.save();
        c.sendSuccess = true;
        return this.render(
            AuthModule.settings.forgotPasswordTemplatePath,
            req,
            c
        );
    }
}
