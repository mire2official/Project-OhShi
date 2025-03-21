import { getAllProducts } from "@/utils/shopify"
import Header from "@/components/Header"
import ProductGrid from "@/components/ProductGrid"

export const revalidate = 60 // Revalidate every minute

export default async function ReleasesPage() {
  const products = await getAllProducts()

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-12">Latest Releases</h1>
        <ProductGrid products={products} />
      </div>
      {/* Empty div with script to ensure audio continuity */}
      <div id="audio-continuity" suppressHydrationWarning>
        {/* 
          This script ensures the music player state is preserved 
          when entering this page from the landing page
        */}
        <script dangerouslySetInnerHTML={{ 
          __html: `
            // Check for existing music state
            if (typeof window !== 'undefined') {
              console.log("Releases page: Checking for music continuity");
              // Log all music-related localStorage values
              console.log('- musicPosition:', localStorage.getItem('musicPosition'));
              console.log('- musicPlaying:', localStorage.getItem('musicPlaying'));
              console.log('- musicMuted:', localStorage.getItem('musicMuted'));
              console.log('- currentSongIndex:', localStorage.getItem('currentSongIndex'));
            }
          `
        }} />
      </div>
    </div>
  )
}

