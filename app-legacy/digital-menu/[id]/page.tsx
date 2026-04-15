import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  isVeg: boolean
  isSpicy: boolean
  prepTime: number
  isAvailable: boolean
}

async function getDigitalMenuItems(digitalMenuId: string): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/digital-menu/${digitalMenuId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching digital menu:', error)
    return []
  }
}

export default async function DigitalMenuPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // For demo purposes, show hardcoded menu items
  const demoItems = [
    {
      _id: "demo_1",
      name: "Panipuri",
      description: "Crispy hollow puri filled with spiced water, tamarind chutney, potato, onion and chickpeas",
      price: 50,
      category: "Chaat",
      isVeg: true,
      isSpicy: false,
      prepTime: 8,
      isAvailable: true
    },
    {
      _id: "demo_2",
      name: "Dahi Puri",
      description: "Sweet and tangy yogurt topped puri with potatoes, chutneys and sev",
      price: 50,
      category: "Chaat",
      isVeg: true,
      isSpicy: false,
      prepTime: 10,
      isAvailable: true
    },
    {
      _id: "demo_3",
      name: "Masala Puri",
      description: "Spiced potato filled puri topped with chutneys, onions and fresh coriander",
      price: 50,
      category: "Chaat",
      isVeg: true,
      isSpicy: true,
      prepTime: 8,
      isAvailable: true
    },
    {
      _id: "demo_4",
      name: "Sev Puri",
      description: "Crispy puri topped with potatoes, chutneys, sev and tangy spices",
      price: 50,
      category: "Chaat",
      isVeg: true,
      isSpicy: true,
      prepTime: 10,
      isAvailable: true
    },
    {
      _id: "demo_5",
      name: "Bhel Puri",
      description: "Mixed puffed rice with vegetables, chutneys and sev - Mumbai's favorite street food",
      price: 50,
      category: "Chaat",
      isVeg: true,
      isSpicy: true,
      prepTime: 8,
      isAvailable: true
    },
    {
      _id: "demo_6",
      name: "Samosa Chaat",
      description: "Crispy samosa topped with chana masala, chutneys, sev and yogurt",
      price: 60,
      category: "Chaat",
      isVeg: true,
      isSpicy: true,
      prepTime: 12,
      isAvailable: true
    },
    {
      _id: "demo_7",
      name: "Samosa Ragda",
      description: "Samosa served with white peas curry, chutneys and chopped onions",
      price: 60,
      category: "Chaat",
      isVeg: true,
      isSpicy: true,
      prepTime: 12,
      isAvailable: true
    },
    {
      _id: "demo_8",
      name: "Chinese Bhel",
      description: "Fusion Indo-Chinese bhel with noodles, vegetables and schezwan sauce",
      price: 100,
      category: "Chaat",
      isVeg: true,
      isSpicy: true,
      prepTime: 15,
      isAvailable: true
    },
    {
      _id: "demo_9",
      name: "Pav Bhaji",
      description: "Spiced vegetable mash served with butter toasted pav bread and lemon",
      price: 70,
      category: "Pav Bhaji",
      isVeg: true,
      isSpicy: true,
      prepTime: 15,
      isAvailable: true
    },
    {
      _id: "demo_10",
      name: "Mushroom Pav Bhaji",
      description: "Delicious pav bhaji with fresh mushrooms and aromatic spices",
      price: 80,
      category: "Pav Bhaji",
      isVeg: true,
      isSpicy: true,
      prepTime: 18,
      isAvailable: true
    }
  ]

  const groupedItems = demoItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof demoItems>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-10"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-red-200 rounded-full opacity-10"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-200 rounded-full opacity-10"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-orange-300 rounded-full opacity-10"></div>
      </div>

      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Digital Menu
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Fresh and delicious food from our canteen • Prepared with love • Served with care
          </p>

          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Veg Options Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Spicy Options Available</span>
            </div>
          </div>
        </div>

        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 relative inline-block">
                {category}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </h2>
              <p className="text-gray-600 mt-4">
                {categoryItems.length} delicious {category.toLowerCase()} option{categoryItems.length !== 1 ? 's' : ''} available
              </p>
            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryItems.map((item) => (
                <Card key={item._id} className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  {/* Decorative gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-16 h-16 border-2 border-orange-200 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 border border-red-200 rounded-full"></div>
                  </div>

                  <CardHeader className="relative pb-4 pt-6 px-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">
                          {item.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {item.isVeg && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 px-2 py-1 text-xs font-medium">
                              🥬 Veg
                            </Badge>
                          )}
                          {item.isSpicy && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 px-2 py-1 text-xs font-medium">
                              🌶️ Spicy
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300">
                          ₹{item.price}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {item.prepTime} min
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative px-6 pb-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                      "{item.description}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Ready in {item.prepTime} minutes
                        </span>
                      </div>

                      {!item.isAvailable && (
                        <Badge variant="destructive" className="text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>

                    {/* Decorative bottom border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-sm">🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Campus Canteen</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Serving delicious, hygienic food to students and staff since 2024
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>📍 Campus Food Court</span>
              <span>🕒 Mon-Sat: 8AM-8PM</span>
              <span>📞 Order by Phone</span>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              © 2024 Canteen Management System • Powered by AI Technology
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
