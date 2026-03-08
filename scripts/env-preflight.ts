#!/usr/bin/env node

import { getArtifactStorageConfigCheck } from '../src/lib/artifacts/storage';

type Status = 'pass' | 'warn' | 'fail';

interface CheckResult {
  name: string;
  status: Status;
  message?: string;
}

const args = process.argv.slice(2);

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

function getArgValue(name: string): string | null {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) {
    return direct.slice(name.length + 1);
  }

  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }

  return null;
}

function parseRequiredEnvVars(): string[] {
  const fromArg = getArgValue('--require-env');
  if (!fromArg) {
    return [];
  }

  return fromArg
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function checkRequiredEnvironment(required: string[]): CheckResult {
  if (required.length === 0) {
    return {
      name: 'required_environment',
      status: 'pass',
    };
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length === 0) {
    return {
      name: 'required_environment',
      status: 'pass',
    };
  }

  return {
    name: 'required_environment',
    status: 'fail',
    message: `Missing required environment variables: ${missing.join(', ')}`,
  };
}

function checkArtifactStorage(strict: boolean): CheckResult {
  const check = getArtifactStorageConfigCheck();

  if (!strict && check.status === 'fail') {
    return {
      name: 'artifact_storage',
      status: 'warn',
      message: check.message,
    };
  }

  return {
    name: 'artifact_storage',
    status: check.status,
    message: check.message,
  };
}

function checkInvoiceEmailConfig(strict: boolean): CheckResult {
  const provider = (process.env.INVOICE_EMAIL_PROVIDER || 'log').trim().toLowerCase();

  if (!provider || provider === 'log') {
    return {
      name: 'invoice_email',
      status: 'pass',
      message: 'Invoice email provider is log mode.',
    };
  }

  if (provider === 'resend') {
    const missing: string[] = [];
    if (!process.env.RESEND_API_KEY) {
      missing.push('RESEND_API_KEY');
    }
    if (!process.env.EMAIL_FROM) {
      missing.push('EMAIL_FROM');
    }

    if (missing.length > 0) {
      return {
        name: 'invoice_email',
        status: strict ? 'fail' : 'warn',
        message: `Invoice email provider resend missing: ${missing.join(', ')}`,
      };
    }

    const from = (process.env.EMAIL_FROM || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(from)) {
      return {
        name: 'invoice_email',
        status: strict ? 'fail' : 'warn',
        message: 'EMAIL_FROM must be a valid sender email address.',
      };
    }

    return {
      name: 'invoice_email',
      status: 'pass',
      message: 'Invoice email provider resend is configured.',
    };
  }

  return {
    name: 'invoice_email',
    status: strict ? 'fail' : 'warn',
    message: `Unknown INVOICE_EMAIL_PROVIDER value '${provider}'.`,
  };
}

function checkAdyenWebhookConfig(strict: boolean): CheckResult {
  const defaultProvider = (process.env.PAYMENT_PROVIDER || 'stripe').trim().toLowerCase();
  if (defaultProvider !== 'adyen') {
    return {
      name: 'adyen_webhook',
      status: 'pass',
      message: 'Default payment provider is not adyen.',
    };
  }

  const hasAuthToken = Boolean(process.env.ADYEN_WEBHOOK_AUTH_TOKEN);
  const hasHmacKey = Boolean(process.env.ADYEN_HMAC_KEY);

  if (hasAuthToken || hasHmacKey) {
    if (hasHmacKey) {
      try {
        const raw = Buffer.from(process.env.ADYEN_HMAC_KEY || '', 'base64');
        if (!raw.length) {
          throw new Error('empty');
        }
      } catch {
        return {
          name: 'adyen_webhook',
          status: strict ? 'fail' : 'warn',
          message: 'ADYEN_HMAC_KEY must be valid base64.',
        };
      }
    }

    return {
      name: 'adyen_webhook',
      status: 'pass',
      message: 'Adyen webhook verification is configured.',
    };
  }

  return {
    name: 'adyen_webhook',
    status: strict ? 'fail' : 'warn',
    message:
      'PAYMENT_PROVIDER=adyen requires ADYEN_WEBHOOK_AUTH_TOKEN or ADYEN_HMAC_KEY for webhook verification.',
  };
}

function checkFulfillmentCarrierConfig(strict: boolean): CheckResult {
  const mode = (process.env.FULFILLMENT_MODE || 'test').trim().toLowerCase();
  if (mode === 'test') {
    return {
      name: 'fulfillment_carrier',
      status: 'pass',
      message: 'Fulfillment is running in test mode; mock carrier adapters are allowed.',
    };
  }

  if (mode !== 'live') {
    return {
      name: 'fulfillment_carrier',
      status: strict ? 'fail' : 'warn',
      message: `Unknown FULFILLMENT_MODE value '${mode}'. Use 'test' or 'live'.`,
    };
  }

  const carrier = (process.env.DEFAULT_CARRIER || 'fedex').trim().toLowerCase();

  if (carrier === 'fedex') {
    const missing: string[] = [];
    if (!process.env.FEDEX_API_KEY || process.env.FEDEX_API_KEY === 'mock-key') {
      missing.push('FEDEX_API_KEY');
    }
    if (!process.env.FEDEX_ACCOUNT_NUM) {
      missing.push('FEDEX_ACCOUNT_NUM');
    }
    if (missing.length > 0) {
      return {
        name: 'fulfillment_carrier',
        status: strict ? 'fail' : 'warn',
        message: `DEFAULT_CARRIER=fedex missing real configuration: ${missing.join(', ')}`,
      };
    }

    return {
      name: 'fulfillment_carrier',
      status: 'pass',
      message: 'FedEx fulfillment carrier configuration is present.',
    };
  }

  if (carrier === 'ups') {
    const missing: string[] = [];
    if (!process.env.UPS_API_KEY || process.env.UPS_API_KEY === 'mock-key') {
      missing.push('UPS_API_KEY');
    }
    if (!process.env.UPS_ACCOUNT_NUM) {
      missing.push('UPS_ACCOUNT_NUM');
    }
    if (missing.length > 0) {
      return {
        name: 'fulfillment_carrier',
        status: strict ? 'fail' : 'warn',
        message: `DEFAULT_CARRIER=ups missing real configuration: ${missing.join(', ')}`,
      };
    }

    return {
      name: 'fulfillment_carrier',
      status: 'pass',
      message: 'UPS fulfillment carrier configuration is present.',
    };
  }

  if (carrier === 'dhl') {
    const missing: string[] = [];
    if (!process.env.DHL_API_KEY || process.env.DHL_API_KEY === 'mock-key') {
      missing.push('DHL_API_KEY');
    }
    if (missing.length > 0) {
      return {
        name: 'fulfillment_carrier',
        status: strict ? 'fail' : 'warn',
        message: `DEFAULT_CARRIER=dhl missing real configuration: ${missing.join(', ')}`,
      };
    }

    return {
      name: 'fulfillment_carrier',
      status: 'pass',
      message: 'DHL fulfillment carrier configuration is present.',
    };
  }

  return {
    name: 'fulfillment_carrier',
    status: strict ? 'fail' : 'warn',
    message: `Unknown DEFAULT_CARRIER value '${carrier}'.`,
  };
}

function summarize(results: CheckResult[]) {
  const hasFail = results.some((result) => result.status === 'fail');
  const hasWarn = results.some((result) => result.status === 'warn');
  const status: Status = hasFail ? 'fail' : hasWarn ? 'warn' : 'pass';

  return {
    timestamp: new Date().toISOString(),
    status,
    strict: hasFlag('--strict'),
    checks: results,
  };
}

function printReport(report: ReturnType<typeof summarize>): void {
  console.log('ENV_PREFLIGHT_REPORT');
  console.log(JSON.stringify(report, null, 2));
}

function exitCodeFor(status: Status, strict: boolean): number {
  if (status === 'fail') {
    return 1;
  }

  if (strict && status === 'warn') {
    return 1;
  }

  return 0;
}

function main() {
  const strict = hasFlag('--strict');
  const requiredEnv = parseRequiredEnvVars();

  const checks: CheckResult[] = [
    checkArtifactStorage(strict),
    checkInvoiceEmailConfig(strict),
    checkAdyenWebhookConfig(strict),
    checkFulfillmentCarrierConfig(strict),
    checkRequiredEnvironment(requiredEnv),
  ];

  const report = summarize(checks);
  printReport(report);

  process.exit(exitCodeFor(report.status, strict));
}

main();
