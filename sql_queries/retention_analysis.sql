-- Customer Retention Analysis
-- Identifies repeat customers using correct customer identifier

WITH customer_orders AS (
    SELECT 
        c.customer_unique_id,
        COUNT(o.order_id) as total_orders,
        MIN(o.order_purchase_timestamp) as first_order,
        MAX(o.order_purchase_timestamp) as last_order
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
)
SELECT 
    CASE 
        WHEN total_orders = 1 THEN 'One-time Customer'
        WHEN total_orders = 2 THEN 'Returning Customer'
        WHEN total_orders >= 3 THEN 'Loyal Customer'
    END as customer_segment,
    COUNT(*) as customer_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage,
    ROUND(AVG(total_orders), 2) as avg_orders_per_customer
FROM customer_orders
GROUP BY 1
ORDER BY customer_count DESC;

git remote add origin https://github.com/Guri-21/ecommerce-customer-retention-analysis.git
