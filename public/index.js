const service = axios.create({
    baseURL: "/",
});

let isRefreshing = false; // 刷新token状态
let refreshRequest = [];

// 添加请求拦截器
service.interceptors.request.use(
    function (config) {
        config.headers.token = localStorage.getItem("token") || "";
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
service.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        // 处理当返回的状态码是401
        const refreshToken = localStorage.getItem("refreshToken");
        const config = error.config;
        if (error.response.status === 401 && refreshToken) {
            if (!isRefreshing) {
                // 防止多次请求刷新token
                isRefreshing = true;
                return service({
                    method: "get",
                    url: "refreshToken",
                    params: {
                        refreshToken,
                    },
                })
                    .then((res) => {
                        localStorage.setItem("token", res.token);
                        localStorage.setItem("refreshToken", res.refreshToken);
                        config.headers.token = res.token;
                        refreshRequest.forEach((item) => {
                            item(res.token);
                        });
                        refreshRequest = [];
                        return service(config);
                    })
                    .catch(() => {
                        // 跳转登陆页
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            } else {
                return new Promise((resolve) => {
                    // 保存到一个队列里面，等刷新完token再执行
                    refreshRequest.push((token) => {
                        config.headers.token = token;
                        resolve(service(config));
                    });
                });
            }
        }
        return Promise.reject(error);
    }
);

function getUserInfo() {
    return service({
        method: "get",
        url: "getUserInfo",
    });
}

function getUserBooks() {
    return service({
        method: "get",
        url: "getUserBooks",
    });
}

window.onload = function () {
    const getTokenBtn = document.getElementById("getToken");
    const tokenBox = document.getElementById("tokenBox");
    const getUserInfoBtn = document.getElementById("getUserInfo");
    const userInfoBox = document.getElementById("userInfoBox");
    const getUserInfoAndBooks = document.getElementById("getUserInfoAndBooks");
    const userAndBooksInfoBox = document.getElementById("userAndBooksInfoBox");

    // 获取token
    getTokenBtn.addEventListener("click", function () {
        service({
            method: "get",
            url: "getToken",
        }).then((res) => {
            localStorage.setItem("token", res.token);
            localStorage.setItem("refreshToken", res.refreshToken);
            tokenBox.innerText = res.token;
        });
    });

    // 获取用户信息
    getUserInfoBtn.addEventListener("click", async function () {
        const res = await getUserInfo();
        userInfoBox.innerText = res.id;
    });

    // 获取用户信息和书本信息
    getUserInfoAndBooks.addEventListener("click", async function () {
        Promise.all([getUserInfo(), getUserBooks()]).then(
            ([userRes, bookRes]) => {
                userAndBooksInfoBox.innerHTML = `
                id: ${userRes.id},
                books: ${JSON.stringify(bookRes.books)}
            `;
            }
        );
    });
};
