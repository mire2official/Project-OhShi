const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

// Check if environment variables are set
const isConfigured = domain && storefrontAccessToken

// Create a mock data function for development when Shopify isn't configured
function getMockProducts() {
  return [
    {
      id: "gid://shopify/Product/1",
      name: "Freedom Tee",
      handle: "freedom-tee",
      description:
        "Premium quality oversized t-shirt with custom ORVELLO design. Made from 100% organic cotton for maximum comfort and durability.",
      price: "49.99",
      currencyCode: "USD",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mockup%2011%20.png-YwrmjEVJxCiDdJGChwP06gl8thI5sm.jpeg",
      images: ["/assets/mockup11.png", "/assets/mockup22.png"],
      category: "T-Shirts",
    },
    {
      id: "gid://shopify/Product/2",
      name: "Peace Tee",
      handle: "peace-tee",
      description:
        "Premium quality oversized t-shirt with custom ORVELLO design. Made from 100% organic cotton for maximum comfort and durability.",
      price: "49.99",
      currencyCode: "USD",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mockup%2022.png-6p1K2QKw3qUi72KphcRaDI8l4RCMl0.jpeg",
      images: ["/assets/mockup22.png", "/assets/mockup11.png"],
      category: "T-Shirts",
    },
    {
      id: "gid://shopify/Product/3",
      name: "Unity Tee",
      handle: "unity-tee",
      description:
        "Premium quality oversized t-shirt with custom ORVELLO design. Made from 100% organic cotton for maximum comfort and durability.",
      price: "49.99",
      currencyCode: "USD",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mockup%2011%20.png-YwrmjEVJxCiDdJGChwP06gl8thI5sm.jpeg",
      images: ["/assets/mockup11.png", "/assets/mockup22.png"],
      category: "T-Shirts",
    },
  ]
}

async function ShopifyData(query) {
  // If Shopify isn't configured, log a warning and return mock data
  if (!isConfigured) {
    console.warn("Shopify environment variables not configured. Using mock data.")
    return { data: null }
  }

  const URL = `https://${domain}/api/2023-07/graphql.json`

  const options = {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }

  try {
    const response = await fetch(URL, options)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Shopify API request error:", error)
    throw new Error("Shopify API request failed")
  }
}

export async function getAllProducts() {
  // If Shopify isn't configured, return mock data
  if (!isConfigured) {
    console.warn("Using mock product data")
    return getMockProducts()
  }

  const query = `
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 2) {
              edges {
                node {
                  src
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await ShopifyData(query)

    if (!response.data) {
      console.warn("No data received from Shopify, using mock data")
      return getMockProducts()
    }

    const products = response.data.products.edges.map(({ node }) => {
      const imageUrl = node.images.edges[0]?.node.src || 
        "/assets/mockup11.png";
      
      // Create an images array for consistent interface
      const images = node.images.edges.map(edge => edge.node.src);
      if (images.length === 0) {
        images.push("/assets/mockup11.png", "/assets/mockup22.png");
      } else if (images.length === 1) {
        images.push("/assets/mockup22.png");
      }
      
      return {
        id: node.id,
        name: node.title,
        handle: node.handle,
        description: node.description,
        price: node.variants.edges[0]?.node.priceV2.amount || "49.99",
        currencyCode: node.variants.edges[0]?.node.priceV2.currencyCode || "USD",
        imageUrl,
        images,
        category: "T-Shirts", // Default category
      };
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error)
    console.warn("Falling back to mock data")
    return getMockProducts()
  }
}

export async function getProductByHandle(handle) {
  // If Shopify isn't configured or handle is missing, return mock data
  if (!isConfigured || !handle) {
    console.warn("Using mock product data for handle:", handle)
    const mockProducts = getMockProducts()
    return mockProducts.find((p) => p.handle === handle) || mockProducts[0]
  }

  const query = `
    {
      productByHandle(handle: "${handle}") {
        id
        title
        handle
        description
        images(first: 5) {
          edges {
            node {
              src
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              priceV2 {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await ShopifyData(query)

    if (!response.data || !response.data.productByHandle) {
      console.warn("Product not found in Shopify, using mock data")
      const mockProducts = getMockProducts()
      return mockProducts.find((p) => p.handle === handle) || null
    }

    const product = response.data.productByHandle;
    const images = product.images.edges.map((edge) => edge.node.src);
    
    if (images.length === 0) {
      images.push("/assets/mockup11.png", "/assets/mockup22.png");
    } else if (images.length === 1) {
      images.push("/assets/mockup22.png");
    }
    
    return {
      id: product.id,
      name: product.title,
      handle: product.handle,
      description: product.description,
      price: product.variants.edges[0]?.node.priceV2.amount || "49.99",
      currencyCode: product.variants.edges[0]?.node.priceV2.currencyCode || "USD",
      imageUrl: images[0],
      images,
      category: "T-Shirts", // Default category
    };
  } catch (error) {
    console.error("Error fetching product by handle:", error)
    console.warn("Falling back to mock data")
    const mockProducts = getMockProducts()
    return mockProducts.find((p) => p.handle === handle) || null
  }
}

export async function createCheckout(variantId) {
  // If Shopify isn't configured, return mock data
  if (!isConfigured) {
    console.warn("Using mock checkout data")
    return "/checkout-success"
  }

  const query = `
    mutation {
      checkoutCreate(input: {
        lineItems: [{ variantId: "${variantId}", quantity: 1 }]
      }) {
        checkout {
          id
          webUrl
        }
      }
    }
  `

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors[0].message)
    }

    const checkout = data.data.checkoutCreate.checkout
    return checkout.webUrl
  } catch (error) {
    console.error("Error creating checkout:", error)
    console.warn("Falling back to mock checkout")
    return "/checkout-success"
  }
}

