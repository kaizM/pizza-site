// Form data persistence utility for saving and restoring form values
export class FormPersistence {
  private static storageKey = 'lemur_express_form_data';

  // Save form data to localStorage
  static saveFormData(formId: string, data: Record<string, any>) {
    try {
      const existingData = this.getAllFormData();
      existingData[formId] = {
        ...data,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }

  // Get specific form data
  static getFormData(formId: string): Record<string, any> {
    try {
      const allData = this.getAllFormData();
      return allData[formId] || {};
    } catch (error) {
      console.warn('Failed to load form data:', error);
      return {};
    }
  }

  // Get all saved form data
  static getAllFormData(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('Failed to parse form data:', error);
      return {};
    }
  }

  // Clear specific form data
  static clearFormData(formId: string) {
    try {
      const existingData = this.getAllFormData();
      delete existingData[formId];
      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    } catch (error) {
      console.warn('Failed to clear form data:', error);
    }
  }

  // Clear all form data
  static clearAllFormData() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear all form data:', error);
    }
  }

  // Auto-save form data on input change
  static setupAutoSave(formId: string, form: any, fields: string[]) {
    const saveData = () => {
      const values = form.getValues();
      const dataToSave = fields.reduce((acc, field) => {
        if (values[field] !== undefined && values[field] !== '') {
          acc[field] = values[field];
        }
        return acc;
      }, {} as Record<string, any>);
      
      if (Object.keys(dataToSave).length > 0) {
        this.saveFormData(formId, dataToSave);
      }
    };

    // Debounced save function
    let saveTimeout: NodeJS.Timeout;
    return () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveData, 500); // Save after 500ms of inactivity
    };
  }
}

// Hook for form persistence
export function useFormPersistence(formId: string, form: any, fields: string[]) {
  const restoreFormData = () => {
    const savedData = FormPersistence.getFormData(formId);
    if (Object.keys(savedData).length > 0) {
      // Remove lastSaved timestamp before setting form values
      const { lastSaved, ...formValues } = savedData;
      
      // Only set values that exist in the saved data
      Object.entries(formValues).forEach(([key, value]) => {
        if (fields.includes(key) && value !== undefined && value !== '') {
          form.setValue(key, value);
        }
      });
    }
  };

  const setupAutoSave = () => {
    return FormPersistence.setupAutoSave(formId, form, fields);
  };

  const clearSavedData = () => {
    FormPersistence.clearFormData(formId);
  };

  return {
    restoreFormData,
    setupAutoSave,
    clearSavedData
  };
}