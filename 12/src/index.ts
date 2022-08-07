interface VirtualWalletBo {
  id: number;
  createTime: number;
  balance: number;
}

enum TransactionType { DEBIT, CREDIT, TRANSFER;}

class VirtualWalletRepository {
  wallets: VirtualWalletBo[];
  constructor() {
    this.wallets = [
      { id: 1, createTime: +new Date(), balance: 199 },
      { id: 2, createTime: +new Date(), balance: 288 },
    ];
  }
  getWalletEntity(walletId: number): VirtualWalletBo {
    return this.wallets.find((wallet) => wallet.id === walletId)!;
  }
  getBalance(walletId: number): number {
    return this.getWalletEntity(walletId).balance
  }
  updateBalance(walletId: number, balance: number): void {
    this.wallets.forEach(wallet => {
        if(wallet.id === walletId) {
            wallet.balance = balance
        }
    })
  }
}
class VirtualWalletTransactionEntity {
    private id!: number;
    private createTime!: number;
    private type!: TransactionType;
    private fromWalletId!: number;
    private toWalletId?: number;
    private amount!: number;
    constructor() {

    }
    setAmount(amount: number): void {
        this.amount = amount;
    }
    setCreateTime(createTime: number): void {
        this.createTime = createTime;
    }

    setType(type: TransactionType): void {
        this.type = type
    }
    setFromWalletId(walletId: number): void {
        this.fromWalletId = walletId
    }
    setToWalletId(walletId: number): void {
        this.toWalletId = walletId
    }
}

class VirtualWalletTransactionRepository {
    private transactions: VirtualWalletTransactionEntity[] = []
    saveTransaction(transaction: VirtualWalletTransactionEntity) {
        this.transactions.push(transaction)
    }
}

class VirtualWallService {
  private walltRepo: VirtualWalletRepository;
  private transactionRepo: VirtualWalletTransactionRepository;

  constructor() {
    this.walltRepo = new VirtualWalletRepository();
    this.transactionRepo = new VirtualWalletTransactionRepository();
  }

  getVirtualWallet(walletId: number): VirtualWalletBo{
    return this.walltRepo.getWalletEntity(walletId);
  }

  getBalance(walletId: number): number {
    return this.walltRepo.getBalance(walletId)
  }

  public debit(walletId: number, amount: number): void {
    const walletEntity = this.getVirtualWallet(walletId)
    const balance = walletEntity.balance;
    if(balance - amount < 0) {
        throw new Error("余额不足")
    }
    const transactionEntity = new VirtualWalletTransactionEntity()
    transactionEntity.setAmount(amount)
    transactionEntity.setCreateTime(+ new Date())
    transactionEntity.setType(TransactionType.DEBIT)
    transactionEntity.setFromWalletId(walletId)
    this.transactionRepo.saveTransaction(transactionEntity)
    this.walltRepo.updateBalance(walletId, balance - amount)
  }

  public credit(walletId: number, amount: number): void {
    const walletEntity = this.getVirtualWallet(walletId)
    const balance = walletEntity.balance;
 
    const transactionEntity = new VirtualWalletTransactionEntity()
    transactionEntity.setAmount(amount)
    transactionEntity.setCreateTime(+ new Date())
    transactionEntity.setType(TransactionType.CREDIT)
    transactionEntity.setFromWalletId(walletId)
    this.transactionRepo.saveTransaction(transactionEntity)
    this.walltRepo.updateBalance(walletId, balance + amount)
  }

  public transfer(fromWalletId: number, toWalletId:number, amount: number): void {
    const transactionEntity = new VirtualWalletTransactionEntity()
    transactionEntity.setAmount(amount)
    transactionEntity.setCreateTime(+ new Date())
    transactionEntity.setType(TransactionType.DEBIT)
    transactionEntity.setFromWalletId(fromWalletId)
    transactionEntity.setToWalletId(toWalletId)
    this.transactionRepo.saveTransaction(transactionEntity)
    
    this.debit(fromWalletId, amount)
    this.credit(toWalletId, amount)
  }
}

export default {};
