import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { MenuItemModel } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    
    const { id: digitalMenuId } = await params
    console.log('Fetching digital menu for ID:', digitalMenuId)
    
    // Find all menu items with this digitalMenuId
    const items = await MenuItemModel.find({ digitalMenuId })
      .select('name description price category isVeg isSpicy prepTime isAvailable')
      .sort({ category: 1, name: 1 })
    
    console.log('Found items:', items.length, items.map(item => ({ name: item.name, digitalMenuId: item.digitalMenuId })))
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching digital menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch digital menu' },
      { status: 500 }
    )
  }
}
