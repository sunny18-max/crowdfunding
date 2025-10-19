const AnalyticsService = require('./services/analyticsService');

console.log('🧪 Testing Analytics API...\n');

async function testAll() {
  try {
    console.log('1. Testing Platform Stats...');
    const stats = await AnalyticsService.getPlatformStats();
    console.log('Platform Stats:', JSON.stringify(stats, null, 2));
    
    console.log('\n2. Testing Pledge Stats...');
    const pledgeStats = await AnalyticsService.getAveragePledgeStats();
    console.log('Pledge Stats:', JSON.stringify(pledgeStats, null, 2));
    
    console.log('\n3. Testing Success Rates...');
    const rates = await AnalyticsService.getCampaignSuccessRates();
    console.log('Success Rates:', JSON.stringify(rates, null, 2));
    
    console.log('\n4. Testing Top Campaigns...');
    const topCampaigns = await AnalyticsService.getTopCampaigns(5);
    console.log('Top Campaigns:', JSON.stringify(topCampaigns, null, 2));
    
    console.log('\n✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAll();
