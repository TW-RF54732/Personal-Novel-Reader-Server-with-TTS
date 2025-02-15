async function register(username, password) {
    const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"  // 允許 Cookie 傳輸
    });

    const result = await response.json();
    console.log(result);
}

async function login(username, password) {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"  // 允許 Cookie 傳輸
    });

    const result = await response.json();
}

async function getUserInfo() {

    const response = await fetch("/api/user", {
        method: "GET",
        credentials: "include"  // 允許 Cookie 傳輸
    });

    const data = await response.json();
    console.log("使用者資訊:", data);
}

async function delUser() {
    const response = await fetch("/api/delete_user", {
        method: "POST",
        credentials: "include"  // 允許 Cookie 傳輸
    });

    const data = await response.json();
    console.log("使用者資訊:", data);
}

async function logout() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"  // 讓 Cookie 被正確刪除
    });

    console.log("登出成功");
}
