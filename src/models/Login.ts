export interface LoginModel {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const createEmptyLoginModel = (): LoginModel => {
  console.log("Debug flow: createEmptyLoginModel fired");
  return {
    email: "",
    password: "",
    rememberMe: false,
  };
};
