import fs from "fs/promises";
import fssync from "fs";
import path from "path";
import os from "os";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/error/index.error.js";
import {
  Prisma,
  type Deposit,
  type TransactionStatus,
} from "../../generated/prisma/index.js";
import type { RequestUser } from "../auth/auth.type.js";
import { DepositRepository } from "./deposit.repository.js";
import type { DepositValidatedInput } from "./deposit.validation.js";
import { DEPOSIT_PROOF_UPLOAD_FOLDER_NAME } from "../../common/config/envVariables.js";
const DEPOSIT_PROOF_UPLOAD_PATH = path.join(
  os.homedir(),
  DEPOSIT_PROOF_UPLOAD_FOLDER_NAME
);

import { DepositProofRepository } from "./depositProof.repository.js";
import { v4 as uuidv4 } from "uuid";
import { ensureAuthorizedUser } from "../../common/util/auth.util.js";

export class DepositService {
  static async create(
    userId: number,
    data: DepositValidatedInput,
    files: Express.Multer.File[]
  ): Promise<Deposit> {
    const prismaData: Prisma.DepositCreateInput = {
      user: { connect: { id: userId } },
      cryptocurrency: { connect: { id: data.cryptocurrencyId } },
      amount: new Prisma.Decimal(data.amount),
      transactionHash: data.transactionHash ?? null,
      adminNotes: data.adminNotes ?? null,
    };

    const filenameMap = await Promise.all(
      files.map(async (file) => {
        const sanitizedOriginal = file.originalname.replace(
          /[^a-zA-Z0-9.\-_]/g,
          "_"
        );
        const uniqueId = uuidv4();
        const uniqueFilename = `${uniqueId}.${sanitizedOriginal}`;
        return { buffer: file.buffer, filename: uniqueFilename };
      })
    );

    const fileNames = filenameMap.map((f) => f.filename);
    const deposit = await DepositRepository.createWithProofs(
      prismaData,
      fileNames
    );

    const depositFolder = path.join(
      DEPOSIT_PROOF_UPLOAD_PATH,
      userId.toString(),
      deposit.id
    );
    await fs.mkdir(depositFolder, { recursive: true });

    await Promise.all(
      filenameMap.map(async (file) => {
        const filePath = path.join(depositFolder, file.filename);
        await fs.writeFile(filePath, file.buffer);
      })
    );

    return deposit;
  }
  static async findAll(): Promise<Deposit[]> {
    return await DepositRepository.findAll();
  }
  static async findById(
    id: string,
    currentUser: RequestUser
  ): Promise<Deposit> {
    const deposit = await DepositRepository.findById(id);
    if (!deposit) throw new NotFoundError("Deposit not found");
    ensureAuthorizedUser(deposit.userId, currentUser);
    return deposit;
  }
  static async findByUser(
    userId: number,
    currentUser: RequestUser
  ): Promise<Deposit[]> {
    ensureAuthorizedUser(userId, currentUser);
    return await DepositRepository.findByUserId(userId);
  }
  static async totalAmountByUser(
    userId: number,
    currentUser: RequestUser
  ): Promise<number> {
    ensureAuthorizedUser(userId, currentUser);
    const total = await DepositRepository.totalAmountByUser(userId);
    return total ? total : 0;
  }
  static async updateStatus(
    id: string,
    data: { status: TransactionStatus; adminNotes?: string }
  ): Promise<Deposit> {
    const existing = await DepositRepository.findById(id);
    if (!existing) throw new NotFoundError("Deposit not found");
    if (existing.status === "APPROVED") {
      throw new BadRequestError(
        "Cannot update deposit that has already been approved"
      );
    }
    const amount = existing.amount.toNumber();
    const updatedDeposit = await DepositRepository.updateStatusTransaction(
      id,
      data.status,
      data.adminNotes,
      existing.userId,
      amount
    );

    return updatedDeposit;
  }
  static async countAll(): Promise<number> {
    return await DepositRepository.countAll();
  }
  static async getProofsByDepositId(depositId: string) {
    return await DepositProofRepository.findByDepositId(depositId);
  }
  static async downloadProof(
    depositId: string,
    fileName: string,
    requestUser: RequestUser
  ) {
    const deposit =
      await DepositProofRepository.getDepositWithUserId(depositId);
    if (!deposit) throw new NotFoundError("Deposit not found");
    ensureAuthorizedUser(deposit.userId, requestUser);
    const filePath = path.join(
      DEPOSIT_PROOF_UPLOAD_PATH,
      deposit.userId.toString(),
      depositId,
      path.basename(fileName)
    );

    if (!fssync.existsSync(filePath)) throw new NotFoundError("File not found");
    return filePath;
  }
  static async deleteProof(
    depositId: string,
    fileName: string,
    requestUser: RequestUser
  ) {
    const deposit =
      await DepositProofRepository.getDepositWithUserId(depositId);
    if (!deposit) throw new NotFoundError("Deposit not found");

    ensureAuthorizedUser(deposit.userId, requestUser);

    const proofs = await DepositProofRepository.findByDepositId(depositId);
    if (proofs.length <= 1)
      throw new BadRequestError("Cannot delete the last proof");

    const target = proofs.find((p) => p.filename === fileName);
    if (!target) throw new NotFoundError("Proof not found");

    const filePath = path.join(
      DEPOSIT_PROOF_UPLOAD_PATH,
      deposit.userId.toString(),
      depositId,
      fileName
    );
    if (fssync.existsSync(filePath)) await fs.unlink(filePath);
    await DepositProofRepository.deleteById(target.id);
  }
  static async addProofs(
    depositId: string,
    files: Express.Multer.File[],
    requestUser: RequestUser
  ) {
    const deposit =
      await DepositProofRepository.getDepositWithUserId(depositId);
    if (!deposit) throw new NotFoundError("Deposit not found");

    if (requestUser.userId !== deposit.userId)
      throw new ForbiddenError("Only depositer can add deposit's proof.");

    const existing = await DepositProofRepository.findByDepositId(depositId);
    if (existing.length + files.length > 3)
      throw new BadRequestError("Cannot exceed 3 proofs");

    const folder = path.join(
      DEPOSIT_PROOF_UPLOAD_PATH,
      deposit.userId.toString(),
      depositId
    );
    await fs.mkdir(folder, { recursive: true });

    const saved = [];
    for (const file of files) {
      const sanitizedOriginal = file.originalname.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "_"
      ); 
        const uniqueId = uuidv4();

      const uniqueFilename = `${uniqueId}.${sanitizedOriginal}`;

      const dest = path.join(folder, uniqueFilename);
      await fs.writeFile(dest, file.buffer);

      const created = await DepositProofRepository.create({
        depositId,
        filename: uniqueFilename,
      });
      saved.push(created);
    }

    return saved;
  }
}
