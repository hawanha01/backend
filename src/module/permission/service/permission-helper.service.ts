import { Injectable } from '@nestjs/common';
import { PermissionCode } from '../enum/permission-code.enum';
import { PermissionAction } from '../enum/permission-action.enum';
import {
  PERMISSION_CODE_ACTION_MAPPING,
  getAllowedActionsForCode,
  isActionAllowedForCode,
  getCodesByResource,
} from '../config/permission-mapping.config';

@Injectable()
export class PermissionHelperService {
  /**
   * Get all allowed actions for a specific permission code
   */
  getAllowedActions(code: PermissionCode): PermissionAction[] {
    return getAllowedActionsForCode(code);
  }

  /**
   * Check if a specific action is allowed for a permission code
   */
  isActionAllowed(code: PermissionCode, action: PermissionAction): boolean {
    return isActionAllowedForCode(code, action);
  }

  /**
   * Get all permission codes for a specific resource
   */
  getCodesByResource(resource: string): PermissionCode[] {
    return getCodesByResource(resource);
  }

  /**
   * Get all permission codes
   */
  getAllCodes(): PermissionCode[] {
    return Object.values(PermissionCode);
  }

  /**
   * Get all actions
   */
  getAllActions(): PermissionAction[] {
    return Object.values(PermissionAction);
  }

  /**
   * Get permission code metadata (name, description, etc.)
   */
  getCodeMetadata(code: PermissionCode): {
    code: PermissionCode;
    allowedActions: PermissionAction[];
    resource: string;
    action: PermissionAction;
  } {
    const [resource, action] = code.split('.');
    return {
      code,
      allowedActions: getAllowedActionsForCode(code),
      resource: resource || '',
      action: (action as PermissionAction) || PermissionAction.READ,
    };
  }

  /**
   * Validate if a permission code exists
   */
  isValidCode(code: string): code is PermissionCode {
    return Object.values(PermissionCode).includes(code as PermissionCode);
  }

  /**
   * Validate if a permission action exists
   */
  isValidAction(action: string): action is PermissionAction {
    return Object.values(PermissionAction).includes(action as PermissionAction);
  }
}

