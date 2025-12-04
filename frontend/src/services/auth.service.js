import AccountService from "./account.service";
import AuthorizedService from "./authorized.service";
import UserService from "./user.service";

const AuthService = {
  login: async (phone, password) => {
    const accounts = await AccountService.list();
    const found = accounts.find(acc => {
      const accPhone = acc.ACCOUNT_Phone ?? acc.USER_Phone ?? acc.phone ?? acc.USER_Phone;
      const accPass = acc.ACCOUNT_Password ?? acc.password ?? acc.pass;
      return String(accPhone) == String(phone) && String(accPass) == String(password);
    });

    if (!found) return null;

    const accountId = found.ACCOUNT_Id ?? found.id;
    const authz = await AuthorizedService.getByAccountId(accountId);
    if (!authz) return null;
    const roleName = authz.role;

    let userInfo = null;
    if (roleName && roleName.toLowerCase() == "customer") {
      userInfo = await UserService.getByPhone(phone);
    }

    // 5. Lưu vào localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("accountId", String(accountId));
    localStorage.setItem("phone", String(phone));
    localStorage.setItem("role", roleName || "");
    if (userInfo) {
      localStorage.setItem("userName", userInfo.USER_Name ?? userInfo.name ?? "");
    } else {
      localStorage.setItem("userName", "");
    }

    return {
      account: found,
      role: roleName,
      user: userInfo
    };
  },

  logout: () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accountId");
    localStorage.removeItem("phone");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  }
};

export default AuthService;
