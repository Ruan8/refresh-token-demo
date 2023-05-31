const jwt = require("jsonwebtoken");
const jwt_secret = "jwt_secret";
const refresh_secret = "refresh_secret";

const signJwt = function (data) {
    const token = jwt.sign(data, jwt_secret, {
        expiresIn: 30, // 设置30秒token过期
    });
    const refreshToken = jwt.sign(data, refresh_secret, {
        expiresIn: "7 days",
    });
    return { token, refreshToken };
};

const refreshJwt = function (ctx, next) {
    const { refreshToken } = ctx.query;
    if (!refreshToken) {
        ctx.status = 401;
        ctx.body = {
            code: 401,
            message: "请先登陆！",
        };
    } else {
        try {
            const verify = jwt.verify(refreshToken, refresh_secret);
            if (verify.id) {
                next();
            }
        } catch (err) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                message: err.message,
            };
        }
    }
};

const authJwt = function (ctx, next) {
    const { token } = ctx.request.headers;
    if (!token) {
        ctx.status = 401;
        ctx.body = {
            code: 401,
            message: "请先登陆！",
        };
    } else {
        try {
            const verify = jwt.verify(token, jwt_secret);
            const id = verify.id;
            ctx.user = {
                id,
            };
            next();
        } catch (err) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                message: err.message,
            };
        }
    }
};

module.exports = {
    signJwt,
    authJwt,
    refreshJwt,
};
