import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface ValidatedInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  success?: boolean;
  validationRules?: ValidationRule[];
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  showValidationIcon?: boolean;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  success,
  validationRules = [],
  onValidationChange,
  showValidationIcon = true,
  required = false,
  style,
  onChangeText,
  value,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  const validateInput = (inputValue: string) => {
    const errors: string[] = [];
    
    // Required validation
    if (required && !inputValue.trim()) {
      errors.push('This field is required');
    }
    
    // Custom validation rules
    validationRules.forEach(rule => {
      if (inputValue && !rule.test(inputValue)) {
        errors.push(rule.message);
      }
    });

    setLocalErrors(errors);
    onValidationChange?.(errors.length === 0, errors);
    
    return errors;
  };

  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    if (hasBeenTouched) {
      validateInput(text);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenTouched(true);
    validateInput(value || '');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const hasError = error || (hasBeenTouched && localErrors.length > 0);
  const isValid = success || (hasBeenTouched && value && localErrors.length === 0);
  const displayErrors = error ? [error] : localErrors;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
        isValid && styles.inputContainerValid,
      ]}>
        <TextInput
          style={[styles.input, hasError && styles.inputError]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={stensylColors.textMuted}
          {...textInputProps}
        />
        
        {showValidationIcon && (hasError || isValid) && (
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={hasError ? 'error' : 'check-circle'}
              size={20}
              color={hasError ? stensylColors.errorRed : stensylColors.successGreen}
            />
          </View>
        )}
      </View>
      
      {hasBeenTouched && displayErrors.length > 0 && (
        <View style={styles.errorContainer}>
          {displayErrors.map((errorMsg, index) => (
            <Text key={index} style={styles.errorText}>
              • {errorMsg}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

// Specific validation rules
export const ValidationRules = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  
  password: {
    test: (value: string) => value.length >= 6,
    message: 'Password must be at least 6 characters'
  },
  
  efficiency: {
    test: (value: string) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 1 && num <= 10;
    },
    message: 'Efficiency must be a number between 1 and 10'
  },
  
  notEmpty: {
    test: (value: string) => value.trim().length > 0,
    message: 'This field cannot be empty'
  },
  
  minLength: (min: number) => ({
    test: (value: string) => value.trim().length >= min,
    message: `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number) => ({
    test: (value: string) => value.trim().length <= max,
    message: `Must be no more than ${max} characters`
  }),
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 8,
  },
  required: {
    color: stensylColors.errorRed,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingRight: 16,
  },
  inputContainerFocused: {
    borderColor: stensylColors.primaryAccent,
    backgroundColor: stensylColors.cardBackground,
  },
  inputContainerError: {
    borderColor: stensylColors.errorRed,
  },
  inputContainerValid: {
    borderColor: stensylColors.successGreen,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: stensylColors.textWhite,
  },
  inputError: {
    color: stensylColors.textWhite,
  },
  iconContainer: {
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 8,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: stensylColors.errorRed,
    marginBottom: 2,
  },
}); 