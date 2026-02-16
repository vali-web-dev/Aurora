import { Card, CardFooter, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';

interface ProductCardProps {
  title: string;
  priceCents: number;
  imageUrl: string;
  provider: string;
  rating: number;
  onAddToCart: () => void;
}

export function ProductCard({
  title,
  priceCents,
  imageUrl,
  provider,
  rating,
  onAddToCart,
}: ProductCardProps) {
  const imageStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;

  return (
    <Card hoverable className="overflow-hidden flex flex-col h-full">
      <div
        className="relative h-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden bg-cover bg-center"
        style={imageStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 to-purple-100/80 dark:from-slate-700/80 dark:to-slate-800/80 flex items-center justify-center">
          <div className="text-5xl">📦</div>
        </div>
      </div>

      <div className="flex-grow space-y-2">
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        
        <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">
          {provider}
        </p>

        <div className="flex items-center gap-1">
          <span className="aurora-label text-yellow-500">★</span>
          <span className="aurora-label text-sm text-slate-600 dark:text-slate-400">
            {rating.toFixed(1)}
          </span>
        </div>

        <p className="aurora-label text-lg font-bold text-slate-900 dark:text-slate-50">
          ${(priceCents / 100).toFixed(2)}
        </p>
      </div>

      <CardFooter>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddToCart}
          className="w-full"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
