import {
  Backpack,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  Clock,
  Coffee,
  CupSoda,
  Dumbbell,
  Eraser,
  GraduationCap,
  PenTool,
  ShoppingBag,
  Sparkles,
  Trophy,
  Utensils,
} from 'lucide-react';
import { formatCDU } from '../utils/format.js';

const ICON_MAP = {
  pen: PenTool,
  eraser: Eraser,
  book: BookOpen,
  briefcase: Briefcase,
  backpack: Backpack,
  cup: CupSoda,
  utensils: Utensils,
  coffee: Coffee,
  dumbbell: Dumbbell,
  trophy: Trophy,
  graduation: GraduationCap,
  sparkles: Sparkles,
  calendar: CalendarCheck,
  badge: BadgeCheck,
};

export default function ProductCard({ item, onBuy, availableBalance }) {
  const Icon = ICON_MAP[item.iconKey] || ShoppingBag;
  const canAfford = typeof availableBalance === 'number' ? availableBalance >= item.price : true;

  return (
    <article className="product-card">
      <div className="product-art">
        <span className="product-art-icon" aria-hidden="true">
          <Icon size={28} />
        </span>
        <span className="product-category-pill">{item.category}</span>
        {item.requiresApproval && (
          <span className="product-approval-pill">
            <Clock size={12} aria-hidden="true" /> Requer aprovação
          </span>
        )}
      </div>

      <div className="product-info">
        <h3>{item.name}</h3>
        <p>{item.description}</p>

        <div className="product-bottom">
          <div>
            <b>{formatCDU(item.price)}</b>
            {!canAfford && <small className="product-insufficient">Saldo insuficiente</small>}
          </div>

          <button type="button" onClick={() => onBuy(item)}>
            {item.requiresApproval ? 'Solicitar' : 'Comprar'}
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
