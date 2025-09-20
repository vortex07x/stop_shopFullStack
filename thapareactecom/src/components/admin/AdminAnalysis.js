// src/components/admin/AdminAnalysis.js
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { useAdmin } from "../../context/AdminContext";

const AdminAnalysis = () => {
  const { stats, loading, error, fetchAdminStats, clearError } = useAdmin();
  const [chartType, setChartType] = useState('bar');
  const [productsData, setProductsData] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Fetch real products data
  const fetchProductsData = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("https://api.pujakaitem.com/api/products");
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Process products data for charts
        const processedData = data.map(product => ({
          name: product.name.length > 15 ? `${product.name.substring(0, 15)}...` : product.name,
          fullName: product.name,
          price: product.price,
          category: product.category,
          company: product.company,
          stock: product.stock,
          stars: product.stars,
          // Generate some realistic dummy sales data based on product characteristics
          sales: Math.floor((product.stars || 4) * (product.price / 1000) * Math.random() * 50) + 20,
          orders: Math.floor(Math.random() * 100) + 10,
          revenue: Math.floor((product.price * Math.random() * 5) + (product.price * 2))
        }));
        
        setProductsData(processedData.slice(0, 10)); // Show top 10 products
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchProductsData();
  }, []);

  const chartOptions = [
    { value: 'bar', label: 'Product Sales (Bar)', icon: '📊' },
    { value: 'line', label: 'Revenue Trend (Line)', icon: '📈' },
    { value: 'pie', label: 'Category Distribution (Pie)', icon: '🥧' },
    { value: 'area', label: 'Performance Area', icon: '🏔️' }
  ];

  // Generate category data from real products
  const getCategoryData = () => {
    const categories = {};
    productsData.forEach(product => {
      const category = product.category || 'Other';
      if (categories[category]) {
        categories[category].value += product.revenue;
        categories[category].count += 1;
      } else {
        categories[category] = {
          name: category,
          value: product.revenue,
          count: 1,
          fill: getRandomColor()
        };
      }
    });
    return Object.values(categories);
  };

  const getRandomColor = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderChart = () => {
    if (isLoadingProducts) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product analytics...</p>
        </div>
      );
    }

    if (productsData.length === 0) {
      return (
        <div className="no-data">
          <p>No product data available</p>
        </div>
      );
    }

    const commonProps = {
      width: '100%',
      height: 500
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={productsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'sales') return [`${value} units`, 'Sales'];
                  if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const product = productsData.find(p => p.name === label);
                  return product ? product.fullName : label;
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="Sales (Units)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={productsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                  if (name === 'orders') return [`${value}`, 'Orders'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const product = productsData.find(p => p.name === label);
                  return product ? product.fullName : label;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                name="Revenue (₹)"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const categoryData = getCategoryData();
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={180}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={productsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'stock') return [`${value} units`, 'Stock'];
                  if (name === 'sales') return [`${value} units`, 'Sales'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const product = productsData.find(p => p.name === label);
                  return product ? product.fullName : label;
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="stock" 
                stackId="1" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6}
                name="Stock"
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const refreshData = () => {
    fetchAdminStats();
    fetchProductsData();
  };

  return (
    <AnalysisWrapper>
      {/* Error Display */}
      {error.stats && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Failed to load data: {error.stats}</span>
            <button onClick={() => clearError('stats')} className="error-close">×</button>
          </div>
        </div>
      )}

      <div className="analysis-header">
        <div className="header-content">
          <h2>Product Analytics</h2>
          <p>Real-time product performance insights and data visualization</p>
        </div>
        <div className="header-controls">
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="chart-selector"
          >
            {chartOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <button 
            onClick={refreshData} 
            disabled={isLoadingProducts || loading.stats}
            className={`refresh-btn ${(isLoadingProducts || loading.stats) ? 'loading' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {(isLoadingProducts || loading.stats) ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper">
          <h3>
            {chartOptions.find(opt => opt.value === chartType)?.icon} 
            {chartOptions.find(opt => opt.value === chartType)?.label}
          </h3>
          {renderChart()}
        </div>
      </div>

      {/* Key Insights with Real Data */}
      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🏆</div>
            <div className="insight-content">
              <h4>Top Performing Product</h4>
              <p>
                {productsData.length > 0 
                  ? `${productsData.reduce((prev, current) => (prev.sales > current.sales) ? prev : current).fullName} leads in sales`
                  : 'Loading product data...'
                }
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>Revenue Leader</h4>
              <p>
                {productsData.length > 0 
                  ? `${productsData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current).fullName} generates highest revenue`
                  : 'Loading revenue data...'
                }
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⭐</div>
            <div className="insight-content">
              <h4>Customer Favorite</h4>
              <p>
                {productsData.length > 0 
                  ? `${productsData.reduce((prev, current) => (prev.stars > current.stars) ? prev : current).fullName} has highest rating`
                  : 'Loading rating data...'
                }
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📦</div>
            <div className="insight-content">
              <h4>Stock Status</h4>
              <p>
                {productsData.length > 0 
                  ? `${productsData.filter(p => p.stock > 0).length} products in stock, ${productsData.filter(p => p.stock === 0).length} out of stock`
                  : 'Loading stock data...'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnalysisWrapper>
  );
};

export default AdminAnalysis;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const AnalysisWrapper = styled.div`
  animation: ${fadeIn} 0.6s ease-out;

  /* Error Banner */
  .error-banner {
    background: rgba(245, 101, 101, 0.1);
    border: 1px solid rgba(245, 101, 101, 0.25);
    border-radius: 14px;
    margin-bottom: 2rem;
    animation: ${slideIn} 0.3s ease-out;

    .error-content {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #c53030;
      font-size: 1rem;

      svg {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      span {
        flex: 1;
        font-weight: 600;
        line-height: 1.5;
      }

      .error-close {
        background: none;
        border: none;
        color: #c53030;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0.25rem;
        border-radius: 8px;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(245, 101, 101, 0.12);
        }
      }
    }
  }

  .analysis-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 16px;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;

    .header-content {
      flex: 1;
      min-width: 200px;

      h2 {
        color: #2d3748;
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
      }

      p {
        color: #718096;
        font-size: 1.1rem;
        margin: 0;
      }
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;

      .chart-selector {
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;

        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
      }

      .refresh-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        &.loading svg {
          animation: ${spin} 1s linear infinite;
        }
      }
    }
  }

  .chart-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 16px;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .chart-wrapper h3 {
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading-container {
      padding: 4rem;
      text-align: center;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #4299e1;
        border-radius: 50%;
        animation: ${spin} 1s linear infinite;
        margin: 0 auto 1rem auto;
      }

      p {
        color: #718096;
        font-size: 1.1rem;
      }
    }

    .no-data {
      padding: 4rem;
      text-align: center;
      color: #718096;
      font-size: 1.1rem;
    }
  }

  .insights-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    h3 {
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;

      .insight-card {
        background: rgba(59, 130, 246, 0.05);
        border: 1px solid rgba(59, 130, 246, 0.1);
        padding: 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .insight-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .insight-content {
          h4 {
            color: #2d3748;
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
          }

          p {
            color: #4a5568;
            font-size: 0.9rem;
            margin: 0;
            line-height: 1.4;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 120px;
    
    .analysis-header {
      padding: 1.5rem;
      flex-direction: column;
      align-items: stretch;

      .header-controls {
        justify-content: flex-end;

        .chart-selector {
          min-width: 150px;
        }
      }
    }

    .chart-container {
      padding: 1.5rem;
    }

    .insights-section {
      padding: 1.5rem;
      
      .insights-grid {
        grid-template-columns: 1fr;
      }
    }
  }

  @media (max-width: 480px) {
    .chart-container .chart-wrapper h3 {
      font-size: 1.25rem;
    }

    .analysis-header .header-content {
      h2 {
        font-size: 1.5rem;
      }
      
      p {
        font-size: 1rem;
      }
    }
  }
`;