import { forwardRef } from "react";
import { PremiumButton } from "./premium/Controls";

/**
 * Back-compat wrapper — all Button props map to PremiumButton.
 */
const Button = forwardRef(function Button(props, ref) {
  return <PremiumButton ref={ref} {...props} />;
});

export default Button;
