// Re-export modular actions for backward compatibility
export { signUpAction, signInAction, signOutAction } from "./auth/actions";
export { forgotPasswordAction, resetPasswordAction } from "./auth/password-actions";
export { createUserProfile, getUserProfile } from "./user/actions";

// Sales surveys actions
export { 
  createSalesSurvey, 
  getSalesSurveys, 
  getSalesSurveyStats, 
  createBulkSalesSurveys,
  updateSalesSurvey 
} from "./encuestas-ventas/actions";
