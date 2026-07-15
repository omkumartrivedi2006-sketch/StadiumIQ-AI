import mongoose, { Model, Document } from "mongoose";

// In-memory data store keyed by model name, preserving data across requests
const memoryStore: Record<string, any[]> = {};

export class BaseRepository<T extends Document> {
  protected model: Model<T>;
  protected modelName: string;

  constructor(model: Model<T>) {
    this.model = model;
    this.modelName = model.modelName;
    if (!memoryStore[this.modelName]) {
      memoryStore[this.modelName] = [];
    }
  }

  private isMock(): boolean {
    return process.env.USE_MOCK_REPO === "true";
  }

  private applySchemaDefaults(item: any): any {
    const doc: any = {
      _id: new this.model()._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () { return this; },
      toObject: function () {
        const copy = { ...this };
        delete copy.save;
        delete copy.toObject;
        return copy;
      }
    };

    const paths = this.model.schema.paths;
    for (const key in paths) {
      const path = paths[key];
      if (path.defaultValue !== undefined) {
        if (typeof path.defaultValue === "function") {
          doc[key] = path.defaultValue();
        } else {
          doc[key] = path.defaultValue;
        }
      }
    }

    // Support subdocuments defaults/arrays if necessary
    if (this.modelName === "Stadium" && !doc.gates) doc.gates = [];

    return Object.assign(doc, item);
  }

  async find(
    filter: any = {},
    options: {
      page?: number;
      limit?: number;
      sort?: string | any;
      populate?: string | string[] | any;
      select?: string | any;
    } = {}
  ): Promise<{ docs: T[]; totalDocs: number; limit: number; page: number; pages: number }> {
    if (this.isMock()) {
      let docs = memoryStore[this.modelName] || [];

      // Filter soft-deleted
      docs = docs.filter((d) => d.isDeleted !== true);

      // Perform basic filtering (supporting exact matches, simple $regex, and simple $or)
      docs = docs.filter((doc) => {
        for (const key in filter) {
          const val = filter[key];
          if (val === undefined) continue;

          if (key === "$or" && Array.isArray(val)) {
            const matchedOr = val.some((subFilter) => {
              for (const subKey in subFilter) {
                const subVal = subFilter[subKey];
                if (subVal && typeof subVal === "object" && "$regex" in subVal) {
                  const reg = new RegExp(subVal.$regex, subVal.$options || "i");
                  if (reg.test(doc[subKey] || "")) return true;
                } else if (doc[subKey] === subVal) {
                  return true;
                }
              }
              return false;
            });
            if (!matchedOr) return false;
          } else if (val && typeof val === "object" && "$regex" in val) {
            const reg = new RegExp(val.$regex, val.$options || "i");
            if (!reg.test(doc[key] || "")) return false;
          } else if (val && typeof val === "object" && "$gte" in val) {
            if (!(doc[key] >= val.$gte)) return false;
          } else if (val && typeof val === "object" && "$lte" in val) {
            if (!(doc[key] <= val.$lte)) return false;
          } else if (doc[key] !== val) {
            return false;
          }
        }
        return true;
      });

      // Pagination
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, options.limit || 10);
      const skip = (page - 1) * limit;
      const totalDocs = docs.length;
      const paginatedDocs = docs.slice(skip, skip + limit);
      const pages = Math.ceil(totalDocs / limit);

      return {
        docs: paginatedDocs as any[],
        totalDocs,
        limit,
        page,
        pages,
      };
    }

    // Standard Mongoose query flow
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const activeFilter = { ...filter };
    if (this.model.schema.paths.isDeleted) {
      (activeFilter as any).isDeleted = { $ne: true };
    }

    const query = this.model.find(activeFilter).skip(skip).limit(limit);

    if (options.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ createdAt: -1 });
    }

    if (options.populate) {
      query.populate(options.populate);
    }

    if (options.select) {
      query.select(options.select);
    }

    const [docs, totalDocs] = await Promise.all([
      query.exec(),
      this.model.countDocuments(activeFilter),
    ]);

    const pages = Math.ceil(totalDocs / limit);

    return {
      docs,
      totalDocs,
      limit,
      page,
      pages,
    };
  }

  async findById(id: string, populate?: string | string[] | any): Promise<T | null> {
    if (this.isMock()) {
      const doc = (memoryStore[this.modelName] || []).find((d) => d._id.toString() === id && d.isDeleted !== true);
      return doc || null;
    }

    const filter: any = { _id: id };
    if (this.model.schema.paths.isDeleted) {
      filter.isDeleted = { $ne: true };
    }

    const query = this.model.findOne(filter);
    if (populate) {
      query.populate(populate);
    }
    return query.exec();
  }

  async findOne(filter: any = {}, populate?: string | string[] | any): Promise<T | null> {
    if (this.isMock()) {
      const res = await this.find(filter, { limit: 1 });
      return res.docs[0] || null;
    }

    const activeFilter = { ...filter };
    if (this.model.schema.paths.isDeleted) {
      (activeFilter as any).isDeleted = { $ne: true };
    }

    const query = this.model.findOne(activeFilter);
    if (populate) {
      query.populate(populate);
    }
    return query.exec();
  }

  async create(data: Partial<T> | any): Promise<T> {
    if (this.isMock()) {
      if (Array.isArray(data)) {
        const createdDocs = data.map((item) => {
          const doc = this.applySchemaDefaults(item);
          (memoryStore[this.modelName] || []).push(doc);
          return doc;
        });
        return createdDocs as any;
      }

      const newDoc = this.applySchemaDefaults(data);
      (memoryStore[this.modelName] || []).push(newDoc);
      return newDoc as any;
    }

    const doc = new this.model(data);
    return doc.save();
  }

  async update(id: string, data: mongoose.UpdateQuery<T> | Partial<T>): Promise<T | null> {
    if (this.isMock()) {
      const docs = memoryStore[this.modelName] || [];
      const idx = docs.findIndex((d) => d._id.toString() === id && d.isDeleted !== true);
      if (idx === -1) return null;

      const updated = {
        ...docs[idx],
        ...data,
        updatedAt: new Date(),
      };
      docs[idx] = updated;
      return updated as any;
    }

    const filter: any = { _id: id };
    if (this.model.schema.paths.isDeleted) {
      filter.isDeleted = { $ne: true };
    }
    return this.model.findOneAndUpdate(filter, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    if (this.isMock()) {
      const docs = memoryStore[this.modelName] || [];
      const idx = docs.findIndex((d) => d._id.toString() === id);
      if (idx === -1) return null;

      const doc = docs[idx];
      if (this.model.schema.paths.isDeleted) {
        doc.isDeleted = true;
        return doc as any;
      }
      docs.splice(idx, 1);
      return doc as any;
    }

    if (this.model.schema.paths.isDeleted) {
      return this.model.findByIdAndUpdate(id, { isDeleted: true } as any, { new: true }).exec();
    }
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: any = {}): Promise<number> {
    if (this.isMock()) {
      const res = await this.find(filter, { limit: 999999 });
      return res.totalDocs;
    }

    const activeFilter = { ...filter };
    if (this.model.schema.paths.isDeleted) {
      (activeFilter as any).isDeleted = { $ne: true };
    }
    return this.model.countDocuments(activeFilter);
  }

  async clear(): Promise<void> {
    if (this.isMock()) {
      memoryStore[this.modelName] = [];
      return;
    }
    await this.model.deleteMany({}).exec();
  }
}
