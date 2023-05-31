const KoaRouter = require("koa-router");
const { authJwt, signJwt, refreshJwt } = require("./auth");

const router = KoaRouter();
router.get("/getToken", function (ctx, next) {
    ctx.status = 200;
    ctx.body = {
        ...signJwt({
            id: Date.now(),
        }),
    };
});

router.get("/getUserInfo", authJwt, function (ctx, next) {
    ctx.status = 200;
    ctx.body = {
        id: ctx.user.id,
    };
});

router.get("/refreshToken", refreshJwt, function (ctx) {
    ctx.status = 200;
    ctx.body = {
        ...signJwt({
            id: Date.now(),
        }),
    };
});

router.get("/getUserBooks", authJwt, function (ctx) {
    ctx.status = 200;
    ctx.body = {
        books: [
            {
                name: "book1",
            },
        ],
    };
});

module.exports = router;
