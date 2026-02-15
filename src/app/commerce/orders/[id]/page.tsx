import { OrderDetailPage } from '@/components/commerce/OrderDetailPage';
import { AuroraShell } from '@/components/os/AuroraShell';

interface OrderDetailProps {
  params: { id: string };
}

export default function CommerceOrderDetailPage({ params }: OrderDetailProps) {
  return (
    <AuroraShell>
      <OrderDetailPage orderId={params.id} />
    </AuroraShell>
  );
}
