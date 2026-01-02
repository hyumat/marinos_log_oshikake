import 'dotenv/config';

async function getCredentials(): Promise<{ secretKey: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Stripe connection not available - missing Replit environment variables');
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const settings = data.items?.[0]?.settings;

  if (!settings?.secret) {
    throw new Error('Stripe development connection not found');
  }

  return { secretKey: settings.secret };
}

async function seedProducts() {
  const { default: Stripe } = await import('stripe');
  const { secretKey } = await getCredentials();
  
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-03-31.basil' as any,
  });

  console.log('Creating Stripe products and prices...');

  const existingProducts = await stripe.products.list({ active: true });
  const plusProduct = existingProducts.data.find(p => p.metadata?.plan === 'plus');
  const proProduct = existingProducts.data.find(p => p.metadata?.plan === 'pro');

  if (plusProduct && proProduct) {
    console.log('Products already exist:');
    console.log(`  Plus: ${plusProduct.id}`);
    console.log(`  Pro: ${proProduct.id}`);
    
    const prices = await stripe.prices.list({ active: true, limit: 100 });
    console.log('\nExisting prices:');
    for (const price of prices.data) {
      const product = price.product as string;
      if (product === plusProduct.id || product === proProduct.id) {
        console.log(`  ${price.id}: ${price.unit_amount! / 100} ${price.currency.toUpperCase()} / ${price.recurring?.interval || 'one-time'}`);
      }
    }
    return;
  }

  const plus = await stripe.products.create({
    name: 'Plus',
    description: '観戦記録無制限 - 今季の観戦記録を無制限に記録できます',
    metadata: { plan: 'plus' },
  });
  console.log(`Created Plus product: ${plus.id}`);

  const plusMonthly = await stripe.prices.create({
    product: plus.id,
    unit_amount: 490,
    currency: 'jpy',
    recurring: { interval: 'month' },
  });
  console.log(`  Monthly price: ${plusMonthly.id} (¥490/月)`);

  const plusYearly = await stripe.prices.create({
    product: plus.id,
    unit_amount: 4900,
    currency: 'jpy',
    recurring: { interval: 'year' },
  });
  console.log(`  Yearly price: ${plusYearly.id} (¥4,900/年)`);

  const pro = await stripe.products.create({
    name: 'Pro',
    description: 'フルアクセス - 複数シーズン・エクスポート・高度集計',
    metadata: { plan: 'pro' },
  });
  console.log(`Created Pro product: ${pro.id}`);

  const proMonthly = await stripe.prices.create({
    product: pro.id,
    unit_amount: 980,
    currency: 'jpy',
    recurring: { interval: 'month' },
  });
  console.log(`  Monthly price: ${proMonthly.id} (¥980/月)`);

  const proYearly = await stripe.prices.create({
    product: pro.id,
    unit_amount: 9800,
    currency: 'jpy',
    recurring: { interval: 'year' },
  });
  console.log(`  Yearly price: ${proYearly.id} (¥9,800/年)`);

  console.log('\nProducts and prices created successfully!');
}

seedProducts().catch(console.error);
