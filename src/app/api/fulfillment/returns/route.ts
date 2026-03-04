/**
 * Returns API Route
 * POST /api/fulfillment/returns - Initiate a return
 */

import { NextRequest, NextResponse } from 'next/server';
import fulfillmentService from '@/lib/fulfillment/service';
import { Carrier } from '@/lib/fulfillment/types';

export async function POST(req: NextRequest) {
  try {
    const { trackingNumber, carrier, reason } = await req.json();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number required' },
        { status: 400 }
      );
    }

    try {
      const returnLabel = await fulfillmentService.initiateReturn(trackingNumber, carrier as Carrier);

      return NextResponse.json({
        success: true,
        returnTrackingNumber: returnLabel.returnTrackingNumber,
        returnLabelUrl: returnLabel.labelUrl,
        instructions: {
          step1: 'Download and print your return label',
          step2: 'Pack the item securely using the original packaging if available',
          step3: 'Affix the return label to the outside of the package',
          step4: 'Drop off at any carrier location',
        },
        reason,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Tracking number not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Return initiation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
