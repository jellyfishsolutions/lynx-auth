import * as Joi from "joi";
import SimpleModule from "lynx-framework/simple.module";

export default class AuthModule extends SimpleModule {
    get controllers(): string {
        return __dirname + "/controllers";
    }

    get translation(): string {
        return __dirname + "/locale";
    }
    get views(): string {
        return __dirname + "/views";
    }

    static settings = {
        loginSchema: Joi.object().keys({
            email: Joi.string()
                .email()
                .required()
                .label("{{auth_input_email}}"),
            password: Joi.string()
                .required()
                .min(4)
                .regex(/^[a-zA-Z0-9]{3,30}$/)
                .label("{{auth_input_password}}")
        }),
        forgotPasswordSchema: Joi.object().keys({
            email: Joi.string()
                .email()
                .required()
                .label("{{auth_input_email}}")
        }),
        controllerPath: "/auth",
        loginPath: "/login",
        logoutPath: "/logout",
        forgotPasswordPath: "/forgotPassword",
        loginTemplatePath: "auth/login",
        forgotPasswordTemplatePath: "auth/forgot_password",
        redirectPath: "/",
        mailForgotPasswordHtmlPath: "auth/mails/forgot_password.html",
        mailForgotPasswordTxtPath: "auth/mails/forgot_password.txt",
        context: {
            masterTemplatePath: "./base.njk",
            loginComponentPath: "/auth/login.component"
        }
    };
}
