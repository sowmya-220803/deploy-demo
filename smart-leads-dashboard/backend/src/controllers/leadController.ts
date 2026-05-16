import { Request, Response } from 'express';
import Lead from '../models/Lead';
import { z } from 'zod';

const leadSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).optional(),
    source: z.enum(['Website', 'Instagram', 'Referral'])
});

export const createLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = leadSchema.parse(req.body);
        const lead = await Lead.create(validatedData);
        res.status(201).json(lead);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation Error', errors: (error as any).errors });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

export const getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const { search_term, status, source, sort_by } = req.query;

        let query: any = {};

        if (status) {
            query.status = status;
        }

        if (source) {
            query.source = source;
        }

        if (search_term) {
             query.$or = [
                 { name: { $regex: search_term, $options: 'i' } },
                 { email: { $regex: search_term, $options: 'i' } }
             ];
        }

        let sort: any = { createdAt: -1 }; // default latest
        if (sort_by === 'oldest') {
            sort = { createdAt: 1 };
        }

        const count = await Lead.countDocuments(query);
        const leads = await Lead.find(query).sort(sort).skip(skip).limit(limit);

        res.json({
            leads,
            page,
            pages: Math.ceil(count / limit),
            total: count,
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeadById = async (req: Request, res: Response): Promise<void> => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            res.json(lead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = leadSchema.partial().parse(req.body);
        const lead = await Lead.findById(req.params.id);

        if (lead) {
            Object.assign(lead, validatedData);
            const updatedLead = await lead.save();
            res.json(updatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation Error', errors: (error as any).errors });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            await Lead.deleteOne({ _id: lead._id });
            res.json({ message: 'Lead removed' });
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const exportLeadsCSV = async (req: Request, res: Response): Promise<void> => {
    try {
        const leads = await Lead.find({}).sort({ createdAt: -1 });

        let csv = 'Name,Email,Status,Source,CreatedAt\n';
        leads.forEach(lead => {
            csv += `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${lead.createdAt.toISOString()}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('leads.csv');
        res.send(csv);
    } catch (error: any) {
         res.status(500).json({ message: error.message });
    }
};
