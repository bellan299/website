document.addEventListener('DOMContentLoaded', () => {
  // Only run on wine.html
  const path = window.location.pathname;
  if (!path.endsWith('wine.html')) return;

  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.products.length > 0) {
        // Show all wine products, no filters except category
        const wines = data.products.filter(product => product.category === 'wine');
        const container = document.getElementById('product-list');
        if (!container) return;
        if (wines.length === 0) {
          container.innerHTML = '<p>No wine products found.</p>';
          return;
        }
        container.innerHTML = wines.map(product => `
          <div class="product-card">
            <h3>${product.name}</h3>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width:150px;" />` : ''}
            <p>${product.description || ''}</p>
            <p>Price: $${product.price.toFixed(2)}</p>
            <p>In stock: ${product.stockQuantity}</p>
            ${product.isBestSeller ? `<span class="badge">Best Seller</span>` : ''}
            ${product.isNewArrival ? `<span class="badge">New Arrival</span>` : ''}
          </div>
        `).join('');
      } else {
        document.getElementById('product-list').innerHTML = '<p>No products found.</p>';
      }
    })
    .catch(err => {
      const container = document.getElementById('product-list');
      if (container) container.innerHTML = '<p>Error loading products.</p>';
      console.error(err);
    });
}); 