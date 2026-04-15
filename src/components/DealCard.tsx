import type { Deal } from '@/types/deal'
import DealImage from './DealImage'
import clsx from 'clsx'

interface DealCardProps {
  deal: Deal
  priority?: boolean
  onWishlist?: (deal: Deal) => void
  isWishlisted?: boolean
}

export default function DealCard({ deal, priority = false, onWishlist, isWishlisted }: DealCardProps) {
  const hasDiscount = deal.discountPercent && deal.discountPercent > 0

  return (
    <article
      className={clsx(
        'group relative flex flex-col rounded-xl overflow-hidden',
        'bg-surface-raised border border-white/5',
        'hover:border-primary/40 transition-colors duration-200',
        // Explicit min-height prevents CLS as images load
        'min-h-[280px]'
      )}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div
          className="absolute top-2 left-2 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white"
          aria-label={`${deal.discountPercent}% Rabatt`}
        >
          -{deal.discountPercent}%
        </div>
      )}

      {/* Wishlist button */}
      {onWishlist && (
        <button
          onClick={() => onWishlist(deal)}
          className="absolute top-2 right-2 z-10 rounded-full bg-black/40 p-1.5 text-lg hover:bg-black/60 transition-colors"
          aria-label={isWishlisted ? 'Von Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      )}

      {/* Product image — fixed container size prevents CLS */}
      <div className="relative flex items-center justify-center bg-surface h-[140px] w-full">
        {deal.imageUrl ? (
          <DealImage
            src={deal.imageUrl}
            alt={deal.title}
            width={deal.imageWidth ?? 140}
            height={deal.imageHeight ?? 140}
            priority={priority}
            className="max-h-[130px] max-w-[90%]"
          />
        ) : (
          <span className="text-5xl" aria-hidden>🛒</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <p className="text-xs text-orange-400 font-medium truncate">{deal.supermarket}</p>
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">{deal.title}</h3>

        {deal.category && (
          <span className="text-xs text-gray-400">{deal.category}</span>
        )}

        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {deal.price.toFixed(2).replace('.', ',')} €
          </span>
          {deal.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {deal.originalPrice.toFixed(2).replace('.', ',')} €
            </span>
          )}
        </div>

        {deal.unit && (
          <span className="text-xs text-gray-500">{deal.unit}</span>
        )}

        {deal.validTo && (
          <span className="text-xs text-gray-600 mt-1">
            bis {new Date(deal.validTo).toLocaleDateString('de-DE')}
          </span>
        )}
      </div>
    </article>
  )
}
