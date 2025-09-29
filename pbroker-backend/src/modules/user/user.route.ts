import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { UserController } from "./user.controller.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { ChangePasswordSchema, ExtendedUpdateUserSchema } from "./user.validation.js";

const userRouter = Router();

userRouter.get("/",authenticate, authorize(["ADMIN"]), UserController.getAllUsers);              
userRouter.get("/count", authenticate, authorize(["ADMIN"]), UserController.countUsers);          
userRouter.get("/:id", authenticate, UserController.getUser); 
userRouter.patch("/change-password", authenticate, validate({body:ChangePasswordSchema}), UserController.changePassword); 
userRouter.patch("/:id", authenticate, validate({body:ExtendedUpdateUserSchema}), UserController.updateUserInfo);  
userRouter.delete("/:id", authenticate, authorize(["ADMIN"]), UserController.deleteUser);


export default userRouter;
