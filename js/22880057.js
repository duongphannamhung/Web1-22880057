const API = "https://web1-api.vercel.app/api";
const AUTHENTICATE_API = "https://web1-api.vercel.app/users";
// cách lấy data ta từ API về
async function loadData(request, templateId, viewId) {
    const response = await fetch(`${API}/${request}`);
    const data = await response.json();



    var source = document.getElementById(templateId).innerHTML;
    var template = Handlebars.compile(source);
    var context = { data: data };
    var view = document.getElementById(viewId);
    view.innerHTML = template(context);
}

async function getAuthenticateToken(username, password) {
    let response = await fetch(`${AUTHENTICATE_API}/authenticate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            username,
            password
        })
    }); // tới linh users/authenticate để lấy phần xác nhận gởi mail
    let result = response.json();
    if (response.status == 200) {
        return result.token; // trả về token, laays token để xác thực người dùng
    } else {
        throw new Error("Authentication failed");
    }
}
async function login(e) {
    e.preventDefault(); // ngăn chặn sự kiện mặc định của form
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    document.getElementById("errormessage").innerHTML = ""; // xóa thông báo lỗi trước đó
    try {
        let token = await getAuthenticateToken(username, password); // gọi hàm lấy token
        if (token) {
            localStorage.setItem("token", token); // lưu token vào localStorage
            document.getElementsByClassName('btn-close')[0].click(); // đóng modal
            displayControls();
        }
    } catch (error) {
        document.getElementById("errormessage").innerHTML = error.message; // hiển thị thông báo lỗi
        displayControls(false);
    }

}

function displayControls(isLogin = true) {
    let linkLogins = document.getElementsByClassName('linkLogin');
    let linkLogouts = document.getElementsByClassName('linkLogout');

    let displayLogin = "none"; // chú ý phần hiển thị
    let displayLogout = "block";
    if (!isLogin) {
        displayLogin = 'block';
        displayLogout = 'none';
    }

    for (let i = 0; i < linkLogins.length; i++) {
        linkLogins[i].style.display = displayLogin;
        linkLogouts[i].style.display = displayLogout;
    }
    let leaveComment = document.getElementsByClassName('leave-comment');
    if (leaveCommnet) {
        leaveComment.style.display = displayLogout;
    }
}
async function checkLogin() {
    let isLogin = await verifyToken(); // gọi hàm xác thực token
    displayControls(isLogin); // hiển thị các nút điều khiển dựa trên trạng thái đăng nhập

}

async function verifyToken() {
    let token = localStorage.getItem("token");
    if (token) {
        let response = await fetch(`${AUTHENTICATE_API}/verify`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status == 200) {
            return true; // trả về true nếu xác thực thành công
        }
    }
    return false; // trả về true nếu xác thực thành công, ngược lại false
}

function logout() {
    localStorage.clear(); // xóa token khỏi localStorage
    displayControls(false); // cập nhật giao diện
}