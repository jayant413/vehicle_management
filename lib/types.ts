export interface Vehicle {
  _id: string
  name: string
  ownerName: string
  vehicleNumber: string
  imageUrl: string
  userId: string
  driver?: Driver
  createdAt: Date
  updatedAt: Date
}

export interface Driver {
  name: string
  phoneNumber: string
  aadharImage: string
  panCardImage: string
  itemsGiven: DriverItem[]
}

export interface DriverItem {
  _id?: string
  itemName: string
  itemImage: string
  givenDate: string
}

export interface Repair {
  _id: string
  vehicleId: string
  repairDate: string
  amount: number
  toolName: string
  toolImageUrl: string
  createdAt: Date
  updatedAt: Date
}

