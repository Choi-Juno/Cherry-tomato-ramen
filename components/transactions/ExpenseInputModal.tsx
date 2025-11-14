"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionCategory, PaymentMethod } from "@/types/transaction";

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: "food", label: "식비" },
  { value: "transport", label: "교통비" },
  { value: "shopping", label: "쇼핑" },
  { value: "entertainment", label: "문화/여가" },
  { value: "education", label: "교육" },
  { value: "health", label: "의료/건강" },
  { value: "utilities", label: "공과금" },
  { value: "other", label: "기타" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "카드" },
  { value: "cash", label: "현금" },
  { value: "transfer", label: "이체" },
  { value: "other", label: "기타" },
];

const expenseSchema = z.object({
  amount: z.number().min(1, "금액을 입력해주세요"),
  description: z.string().min(1, "내용을 입력해주세요"),
  category: z.enum([
    "food",
    "transport",
    "shopping",
    "entertainment",
    "education",
    "health",
    "utilities",
    "other",
  ]),
  payment_method: z.enum(["cash", "card", "transfer", "other"]),
  merchant: z.string().optional(),
  date: z.string(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
}

export function ExpenseInputModal({
  open,
  onClose,
  onSubmit,
}: ExpenseInputModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      category: "food",
      payment_method: "card",
    },
  });

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to submit expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left pb-2">
          <DialogTitle className="text-xl font-bold">💰 지출 기록하기</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            간편하게 오늘의 소비를 기록해보세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Amount - Highlighted */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              금액 *
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="10,000"
              {...register("amount", { valueAsNumber: true })}
              className="text-xl font-bold h-14 border-2 focus:border-violet-500"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                ⚠️ {errors.amount.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              내용 *
            </label>
            <Input
              id="description"
              placeholder="점심 식사"
              {...register("description")}
              className="h-12"
            />
            {errors.description && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                ⚠️ {errors.description.message}
              </p>
            )}
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                카테고리 *
              </label>
              <Select
                value={watch("category")}
                onValueChange={(value) =>
                  setValue("category", value as TransactionCategory)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="py-3.5">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label htmlFor="payment_method" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                결제 수단 *
              </label>
              <Select
                value={watch("payment_method")}
                onValueChange={(value) =>
                  setValue("payment_method", value as PaymentMethod)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="py-3.5">
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Merchant & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Merchant (Optional) */}
            <div className="space-y-2">
              <label htmlFor="merchant" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                장소
              </label>
              <Input
                id="merchant"
                placeholder="스타벅스"
                {...register("merchant")}
                className="h-12"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                날짜 *
              </label>
              <Input id="date" type="date" {...register("date")} className="h-12" />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-13 font-semibold"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-13 font-semibold bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

