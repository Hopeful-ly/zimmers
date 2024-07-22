import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function runEvalWithVariables(code:string, variables:Record<string,any>) {
  // Create a function with the provided variables as arguments
  const varNames = Object.keys(variables);
  const varValues = Object.values(variables);

  // Create the function body that includes the eval
  const funcBody = `return eval(${JSON.stringify(code)});`;

  // Create and invoke the function
  const func = new Function(...varNames, funcBody);
  return func(...varValues);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}