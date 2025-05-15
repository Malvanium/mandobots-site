export {};
interface Memory {
    chartOfAccounts?: {
      Revenue?: string[];
      Expenses?: string[];
    };
    vendorDefaults?: {
      [vendor: string]: {
        category: string;
        autoTag?: boolean;
      };
    };
  }
  
  interface ValidationResult {
    category?: string;
    errors: string[];
    autoTagged: boolean;
  }
  
  export function validateTransaction(vendor: string, memory: Memory): ValidationResult {
    const result: ValidationResult = {
      errors: [],
      autoTagged: false,
    };
  
    if (!memory.vendorDefaults || !memory.vendorDefaults[vendor]) {
      result.errors.push(`⚠️ No memory found for vendor "${vendor}"`);
      return result;
    }
  
    const { category, autoTag } = memory.vendorDefaults[vendor];
    result.category = category;
    result.autoTagged = !!autoTag;
  
    // Check if the category exists in chartOfAccounts
    const [type, subcategory] = category.split(" > ").map((s) => s.trim());
  
    if (!memory.chartOfAccounts || !memory.chartOfAccounts[type as "Revenue" | "Expenses"]) {
      result.errors.push(`⚠️ Unknown account type "${type}"`);
      return result;
    }
  
    const accountList = memory.chartOfAccounts[type as "Revenue" | "Expenses"] ?? [];
    if (!accountList.includes(subcategory)) {
      result.errors.push(`⚠️ Subcategory "${subcategory}" not found in "${type}" accounts`);
    }
  
    return result;
  }
  