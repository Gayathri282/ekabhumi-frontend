// src/types/orders.d.ts

declare module "./Orders" {
  import type { JSX } from "react";

  export type OrdersProps = {
    orders?: any[];
    mode?: "pending" | "approved";
    onApprove?: (orderId: any) => void;      // ✅ optional
    selectedIds?: Set<any>;                  // ✅ optional
    onToggleSelect?: (orderId: any) => void; // ✅ optional
  };

  const Orders: (props: OrdersProps) => JSX.Element;
  export default Orders;
}