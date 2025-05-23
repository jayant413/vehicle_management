export interface Vehicle {
  _id: string;
  name: string;
  ownerName: string;
  vehicleNumber: string;
  imageUrl: string;
  pucImage?: string;
  rcImage?: string;
  userId: string;
  driver?: Driver;
  tyres?: Tyre[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  name: string;
  phoneNumber: string;
  aadharImage: string;
  panCardImage: string;
  licenseImage: string;
  driverImage: string;
  itemsGiven: DriverItem[];
  joiningDate?: string;
  panNumber?: string;
  aadharNumber?: string;
  signatureImage?: string;
  licenseNumber?: string;
  address?: string;
}

export interface DriverItem {
  _id?: string;
  itemName: string;
  itemImage: string;
  givenDate: string;
  quantity: string | number;
}

export interface Repair {
  _id: string;
  vehicleId: string;
  repairDate: string;
  amount: number;
  toolName: string;
  toolImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tyre {
  _id?: string;
  tyreNumber: string;
  description: string;
  installedDate: string;
}

export interface Signature {
  _id: string;
  name: string;
  signatureUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
