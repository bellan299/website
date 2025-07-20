document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.products.length > 0) {
        // Just show the first product, regardless of category
        const product = data.products[0];
        document.getElementById('product-list').innerHTML = `
          <div>
            <h3>${product.name}</h3>
            <p>Price: $${product.price.toFixed(2)}</p>
            <p>Category: ${product.category}</p>
          </div>
        `;
      } else {
        document.getElementById('product-list').innerHTML = '<p>No products found.</p>';
      }
    })
    .catch(err => {
      document.getElementById('product-list').innerHTML = '<p>Error loading product.</p>';
      console.error(err);
    });
}); 