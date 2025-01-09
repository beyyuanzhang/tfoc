import type { CollectionBeforeChangeHook } from 'payload';

interface ProductionCosts {
  material: number;
  labor: number;
  packaging: number;
}

interface DevelopmentCosts {
  pattern: number;
  sample: number;
  design: number;
}

interface OperationalRates {
  afterSale: number;
  commission: number;
  channel: number;
  tax: number;
  logistics: number;
}

export const calculatePricing: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // 1. 避免重复计算
  if (operation !== 'create' && operation !== 'update') return data;
  if (data._isCalculating) return data;

  try {
    // 2. 标记正在计算
    data._isCalculating = true;

    // 1. 基础数据准备
    const production: ProductionCosts = {
      material: Number(data?.costs?.production?.material || 0),
      labor: Number(data?.costs?.production?.labor || 0),
      packaging: Number(data?.costs?.production?.packaging || 0)
    };

    const development: DevelopmentCosts = {
      pattern: Number(data?.costs?.development?.pattern || 0),
      sample: Number(data?.costs?.development?.sample || 0),
      design: Number(data?.costs?.development?.design || 0)
    };

    const operationalRates: OperationalRates = {
      afterSale: Number(data?.strategy?.operationalCosts?.afterSale || 3),
      commission: Number(data?.strategy?.operationalCosts?.commission || 5),
      channel: Number(data?.strategy?.operationalCosts?.channel || 8),
      tax: Number(data?.strategy?.operationalCosts?.tax || 5),
      logistics: Number(data?.strategy?.operationalCosts?.logistics || 0)
    };

    // 2. 单件成本计算
    const calculateUnitCosts = () => {
      const unitCOGS = production.material + production.labor + production.packaging;
      return { unitCOGS };
    };

    // 3. 价格计算
    const calculatePrices = (unitCOGS: number) => {
      const totalRate = (
        operationalRates.afterSale + 
        operationalRates.commission + 
        operationalRates.channel + 
        operationalRates.tax
      ) / 100;

      const multiplier = Number(data?.strategy?.positioning || '4.5');
      const suggestedPrice = ((unitCOGS * multiplier) + operationalRates.logistics) / (1 - totalRate);
      
      const discountRate = data?.discountStatus === 'discounted' 
        ? Number(data?.customDiscountRate || 100) 
        : 100;
      const discountedPrice = suggestedPrice * (discountRate / 100);

      return { suggestedPrice, discountedPrice, totalRate };
    };

    // 4. 运营成本计算
    const calculateOperationalCosts = (suggestedPrice: number, totalRate: number) => {
      const percentageCosts = suggestedPrice * totalRate;
      const totalOperationalCost = operationalRates.logistics + percentageCosts;
      return { totalOperationalCost };
    };

    // 5. 毛利计算
    const calculateGrossProfit = (discountedPrice: number, unitCOGS: number, totalOperationalCost: number) => {
      const grossProfit = discountedPrice - unitCOGS - totalOperationalCost;
      const grossMargin = (grossProfit / discountedPrice) * 100;
      return { grossProfit, grossMargin };
    };

    // 6. 总成本计算
    const calculateTotalCosts = (unitCOGS: number, totalOperationalCost: number) => {
      const volume = Number(data?.volume || 0);
      const totalDevelopmentCost = development.pattern + development.sample + development.design;
      const totalCOGS = unitCOGS * volume;
      const totalOperationalCosts = totalOperationalCost * volume;
      const totalCost = totalDevelopmentCost + totalCOGS + totalOperationalCosts;
      return { totalDevelopmentCost, totalCOGS, totalOperationalCosts, totalCost, volume };
    };

    // 7. KPI 计算
    const calculateKPIs = (totalCost: number, volume: number) => {
      const finalRetailPrice = data?.finalRetailPrice || data?.strategy?.finalPricing?.suggestedPrice;
      const marketingPercentage = Number(data?.kpiAnalysis?.breakevenAnalysis?.marketingPercentage || 20);
      const returnRate = Number(data?.kpiAnalysis?.breakevenAnalysis?.returnRate || 5);
      const returnRateDecimal = returnRate / 100;

      // 营销成本
      const marketingCost = finalRetailPrice * volume * (marketingPercentage / 100);

      // 回本点计算
      const breakevenUnits = Math.ceil(
        (totalCost + marketingCost) / 
        (finalRetailPrice * (1 - returnRateDecimal))
      );

      // 实际销量计算
      const actualSoldUnits = Math.ceil(breakevenUnits * (1 - returnRateDecimal));
      
      // 获客成本计算
      const cpa = actualSoldUnits > 0 ? Number((marketingCost / actualSoldUnits).toFixed(2)) : 0;
      const cpo = breakevenUnits > 0 ? Number((marketingCost / breakevenUnits).toFixed(2)) : 0;

      return { 
        finalRetailPrice, marketingCost, breakevenUnits, 
        actualSoldUnits, cpa, cpo, returnRateDecimal 
      };
    };

    // 8. 收益预测计算
    const calculateProfitForecast = (totalCost: number, volume: number, returnRateDecimal: number, finalRetailPrice: number) => {
      const expectedActualSales = volume;
      const expectedOrders = Math.ceil(expectedActualSales / (1 - returnRateDecimal));
      
      const fullPriceRate = (Number(data?.kpiAnalysis?.profitForecast?.fullPriceRate || 70)) / 100;
      const discountPriceRate = 1 - fullPriceRate;
      const discountMultiplier = 0.7;

      const expectedTotalRevenue = expectedOrders * finalRetailPrice * (
        fullPriceRate + (discountPriceRate * discountMultiplier)
      );

      const expectedActualRevenue = expectedActualSales * finalRetailPrice * (
        fullPriceRate + (discountPriceRate * discountMultiplier)
      );

      const marketingPercentage = Number(data?.kpiAnalysis?.breakevenAnalysis?.marketingPercentage || 20);
      const expectedMarketingCost = expectedTotalRevenue * (marketingPercentage / 100);
      const expectedTotalCost = totalCost + expectedMarketingCost;

      const expectedNetProfit = expectedActualRevenue - expectedTotalCost;
      const expectedNetProfitMargin = expectedActualRevenue > 0 
        ? (expectedNetProfit / expectedActualRevenue) * 100 
        : 0;
      const expectedROI = Number((expectedActualRevenue / expectedTotalCost).toFixed(2));

      return {
        expectedOrders,
        expectedActualSales,
        expectedTotalRevenue,
        expectedActualRevenue,
        expectedMarketingCost,
        expectedTotalCost,
        expectedNetProfit,
        expectedNetProfitMargin,
        expectedROI
      };
    };

    // 执行所有计算
    const { unitCOGS } = calculateUnitCosts();
    const { suggestedPrice, discountedPrice, totalRate } = calculatePrices(unitCOGS);
    const { totalOperationalCost } = calculateOperationalCosts(suggestedPrice, totalRate);
    const { grossProfit, grossMargin } = calculateGrossProfit(discountedPrice, unitCOGS, totalOperationalCost);
    const { totalDevelopmentCost, totalCOGS, totalOperationalCosts, totalCost, volume } = calculateTotalCosts(unitCOGS, totalOperationalCost);
    const { finalRetailPrice, marketingCost, breakevenUnits, actualSoldUnits, cpa, cpo, returnRateDecimal } = calculateKPIs(totalCost, volume);
    const profitForecast = calculateProfitForecast(totalCost, volume, returnRateDecimal, finalRetailPrice);

    // 返回更新后的数据
    return {
      ...data,
      costs: {
        ...data.costs,
        production: {
          ...data.costs?.production,
          unitCOGS: Number(unitCOGS.toFixed(2))
        }
      },
      strategy: {
        ...data.strategy,
        finalPricing: {
          ...data.strategy?.finalPricing,
          suggestedPrice: Number(suggestedPrice.toFixed(2)),
          discountedPrice: Number(discountedPrice.toFixed(2)),
          grossProfit: Number(grossProfit.toFixed(2)),
          grossMargin: Number(grossMargin.toFixed(2))
        },
        operationalCosts: {
          ...data.strategy?.operationalCosts,
          totalOperationalCost: Number(totalOperationalCost.toFixed(2))
        }
      },
      kpiAnalysis: {
        ...data.kpiAnalysis,
        releaseOverview: {
          ...data.kpiAnalysis?.releaseOverview,
          totalDevelopmentCost: Number(totalDevelopmentCost.toFixed(2)),
          totalCOGS: Number(totalCOGS.toFixed(2)),
          totalOperationalCosts: Number(totalOperationalCosts.toFixed(2)),
          totalCost: Number(totalCost.toFixed(2)),
          unitCost: Number((unitCOGS + totalOperationalCost).toFixed(2)),
          releaseVolume: volume,
          finalPrice: finalRetailPrice
        },
        breakevenAnalysis: {
          ...data.kpiAnalysis?.breakevenAnalysis,
          marketingCost: Number(marketingCost.toFixed(2)),
          breakevenUnits,
          actualSoldUnits,
          cpa,
          cpo
        },
        profitForecast: {
          ...data.kpiAnalysis?.profitForecast,
          expectedOrders: profitForecast.expectedOrders,
          expectedActualSales: profitForecast.expectedActualSales,
          expectedTotalRevenue: Number(profitForecast.expectedTotalRevenue.toFixed(2)),
          expectedActualRevenue: Number(profitForecast.expectedActualRevenue.toFixed(2)),
          expectedMarketingCost: Number(profitForecast.expectedMarketingCost.toFixed(2)),
          expectedTotalCost: Number(profitForecast.expectedTotalCost.toFixed(2)),
          expectedNetProfit: Number(profitForecast.expectedNetProfit.toFixed(2)),
          expectedNetProfitMargin: Number(profitForecast.expectedNetProfitMargin.toFixed(2)),
          expectedROI: profitForecast.expectedROI
        }
      }
    };

  } catch (error) {
    console.error('Error in calculatePricing:', error);
    delete data._isCalculating;
    return data;
  }
};