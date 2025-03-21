import { getProductByHandle, getAllProducts } from "@/utils/shopify"
import Header from "@/components/Header"
import ProductDetail from "@/components/ProductDetail"
import { notFound } from "next/navigation"

export const revalidate = 60 // Revalidate every minute

export async function generateStaticParams() {
  try {
    const products = await getAllProducts()
    return products.map((product) => ({
      handle: product.handle,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
  try {
    const product = await getProductByHandle(params.handle)

    if (!product) {
      return notFound()
    }

    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <ProductDetail product={product} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching product:", error)
    return notFound()
  }
}

