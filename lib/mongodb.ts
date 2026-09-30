import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.DATABASE_URL || '';
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getCampaignsCollection() {
  const c = await getMongoClient();
  return c.db().collection('Campaign');
}

export async function updateCampaignVendorIds(campaignId: string, vendorIds: string[]): Promise<void> {
  try {
    const col = await getCampaignsCollection();
    let query: any = { _id: campaignId };
    if (ObjectId.isValid(campaignId)) {
      query = { $or: [{ _id: new ObjectId(campaignId) }, { _id: campaignId }] };
    }
    await col.updateOne(query, {
      $set: {
        vendorIds: vendorIds.filter(Boolean),
        updatedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Failed to update campaign vendorIds in MongoDB:', err);
  }
}

export async function getAllCampaignVendorIds(): Promise<Record<string, string[]>> {
  try {
    const col = await getCampaignsCollection();
    const docs = await col.find({}, { projection: { _id: 1, vendorIds: 1 } }).toArray();
    const map: Record<string, string[]> = {};
    docs.forEach(doc => {
      const idStr = doc._id.toString();
      if (Array.isArray(doc.vendorIds)) {
        map[idStr] = doc.vendorIds;
      }
    });
    return map;
  } catch (err) {
    console.error('Failed to get campaign vendorIds from MongoDB:', err);
    return {};
  }
}

export async function getCampaignVendorIds(campaignId: string): Promise<string[]> {
  try {
    const col = await getCampaignsCollection();
    let query: any = { _id: campaignId };
    if (ObjectId.isValid(campaignId)) {
      query = { $or: [{ _id: new ObjectId(campaignId) }, { _id: campaignId }] };
    }
    const doc = await col.findOne(query, { projection: { vendorIds: 1 } });
    if (doc && Array.isArray(doc.vendorIds)) {
      return doc.vendorIds;
    }
    return [];
  } catch (err) {
    console.error('Failed to get campaign vendorIds:', err);
    return [];
  }
}
