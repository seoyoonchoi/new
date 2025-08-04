import { StockActionType } from "@/apis/enums/StockActionType";

export interface StockUpdateRequestDto{
    stockActionType: StockActionType;
    employeeId : number;
    bookIsbn: string;
    branchId: number;
    amount: number;
    description? : string;
}