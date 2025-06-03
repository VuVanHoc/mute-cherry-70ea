"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, AlertCircle, Check } from "lucide-react";

interface DateRange {
    from: Date | null;
    to: Date | null;
}

interface DateOption {
    id: number;
    fromDate: Date;
    toDate: Date;
    displayText: string;
}

interface ValidationErrors {
    from?: string;
    to?: string;
}

export default function DateRangePicker() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: null,
        to: null,
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
        null
    );

    // Get today's date in YYYY-MM-DD format
    const getTodayString = (): string => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // Format date to DD/MM format
    const formatDate = (date: Date): string => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}/${month}`;
    };

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (date: Date | null): string => {
        if (!date) return "";
        return date.toISOString().split("T")[0];
    };

    // Parse input date string to Date object
    const parseInputDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    // Validate dates
    const validateDates = (
        fromDate: Date | null,
        toDate: Date | null
    ): ValidationErrors => {
        const newErrors: ValidationErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

        // Validate From date
        if (fromDate) {
            const fromDateOnly = new Date(fromDate);
            fromDateOnly.setHours(0, 0, 0, 0);

            if (fromDateOnly < today) {
                newErrors.from = "From date cannot be in the past";
            }
        }

        // Validate To date
        if (fromDate && toDate) {
            if (toDate < fromDate) {
                newErrors.to = "To date must be after or equal to From date";
            }
        }

        return newErrors;
    };

    // Generate date options based on selected range
    useEffect(() => {
        // Reset current index and selected option when date range changes
        setCurrentIndex(0);
        setSelectedOptionId(null);

        // If no From date selected, clear options
        if (!dateRange.from) {
            setDateOptions([]);
            return;
        }

        // Validate dates
        const validationErrors = validateDates(dateRange.from, dateRange.to);
        setErrors(validationErrors);

        // If there are validation errors, don't generate options
        if (Object.keys(validationErrors).length > 0) {
            setDateOptions([]);
            return;
        }

        const options: DateOption[] = [];

        // If only From date is selected, generate options with 0-day ranges (same day)
        if (dateRange.from && !dateRange.to) {
            for (let i = 0; i < 100; i++) {
                const fromDate = new Date(dateRange.from);
                fromDate.setDate(fromDate.getDate() + i);

                const toDate = new Date(fromDate); // Same day (0-day range)

                options.push({
                    id: i + 1,
                    fromDate,
                    toDate,
                    displayText: `${formatDate(fromDate)}`,
                });
            }
        }
        // If both From and To are selected, generate sliding windows
        else if (dateRange.from && dateRange.to) {
            const daysDiff = Math.ceil(
                (dateRange.to.getTime() - dateRange.from.getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            for (let i = 0; i < 100; i++) {
                const fromDate = new Date(dateRange.from);
                fromDate.setDate(fromDate.getDate() + i);

                const toDate = new Date(fromDate);
                toDate.setDate(toDate.getDate() + daysDiff);

                options.push({
                    id: i + 1,
                    fromDate,
                    toDate,
                    displayText:
                        daysDiff === 0
                            ? `${formatDate(fromDate)}`
                            : `${formatDate(fromDate)}-${formatDate(toDate)}`,
                });
            }
        }

        setDateOptions(options);
    }, [dateRange]);

    const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFromDate = parseInputDate(e.target.value);
        const newRange = { ...dateRange, from: newFromDate };

        // If new From date is after current To date, clear To date
        if (newFromDate && dateRange.to && newFromDate > dateRange.to) {
            newRange.to = null;
        }

        setDateRange(newRange);
    };

    const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newToDate = parseInputDate(e.target.value);
        setDateRange((prev) => ({ ...prev, to: newToDate }));
    };

    const handleOptionSelect = (option: DateOption) => {
        setSelectedOptionId(option.id);
        setDateRange({
            from: option.fromDate,
            to: option.toDate,
        });
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(dateOptions.length - 5, prev + 1));
    };

    const visibleOptions = dateOptions.slice(currentIndex, currentIndex + 5);

    // Get the minimum date for To input (same as From date since 0-day ranges are allowed)
    const getMinToDate = (): string => {
        if (!dateRange.from) return getTodayString();
        return formatDateForInput(dateRange.from);
    };

    // Check if current date range matches an option
    const isOptionSelected = (option: DateOption): boolean => {
        if (!dateRange.from || !dateRange.to) return false;

        const fromMatch =
            dateRange.from.getTime() === option.fromDate.getTime();
        const toMatch = dateRange.to.getTime() === option.toDate.getTime();

        return fromMatch && toMatch;
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            {/* Date Range Picker */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Date Range Picker
                    </CardTitle>
                    <CardDescription>
                        Select a date range to generate infinite sliding date
                        options. From date cannot be in the past.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="from-date">From Date</Label>
                            <Input
                                id="from-date"
                                type="date"
                                value={formatDateForInput(dateRange.from)}
                                onChange={handleFromDateChange}
                                min={getTodayString()}
                                className={`w-full ${
                                    errors.from
                                        ? "border-destructive focus:border-destructive"
                                        : ""
                                }`}
                            />
                            {errors.from && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.from}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="to-date">To Date (Optional)</Label>
                            <Input
                                id="to-date"
                                type="date"
                                value={formatDateForInput(dateRange.to)}
                                onChange={handleToDateChange}
                                min={getMinToDate()}
                                disabled={!dateRange.from}
                                className={`w-full ${
                                    errors.to
                                        ? "border-destructive focus:border-destructive"
                                        : ""
                                }`}
                            />
                            {errors.to && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.to}
                                </div>
                            )}
                            {!dateRange.from && (
                                <div className="text-sm text-muted-foreground">
                                    Select a From date first
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date Range Info */}
                    {dateRange.from && !Object.keys(errors).length && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                                {dateRange.to ? (
                                    <>
                                        {dateRange.from.getTime() ===
                                        dateRange.to.getTime() ? (
                                            <>
                                                Selected date:{" "}
                                                <span className="font-medium text-foreground">
                                                    {formatDate(dateRange.from)}
                                                </span>{" "}
                                                (single day)
                                            </>
                                        ) : (
                                            <>
                                                Selected range:{" "}
                                                <span className="font-medium text-foreground">
                                                    {formatDate(dateRange.from)}{" "}
                                                    to{" "}
                                                    {formatDate(dateRange.to)}
                                                </span>{" "}
                                                (
                                                {Math.ceil(
                                                    (dateRange.to.getTime() -
                                                        dateRange.from.getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                )}{" "}
                                                days)
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        Selected start date:{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(dateRange.from)}
                                        </span>{" "}
                                        (showing single day options)
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Date Options Carousel */}
            {dateOptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Date Range Options
                        </CardTitle>
                        <CardDescription>
                            {dateRange.to
                                ? dateRange.from?.getTime() ===
                                  dateRange.to?.getTime()
                                    ? "Navigate through single day options"
                                    : "Navigate through infinite date range combinations with your selected duration"
                                : "Navigate through single day options starting from your selected date. Click any option to select it."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            {/* Previous Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="flex-shrink-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">
                                    Previous options
                                </span>
                            </Button>

                            {/* Options Container */}
                            <div className="flex-1 overflow-hidden">
                                <div className="flex space-x-4">
                                    {visibleOptions.map((option) => {
                                        const isSelected =
                                            isOptionSelected(option);
                                        return (
                                            <Card
                                                key={option.id}
                                                onClick={() =>
                                                    handleOptionSelect(option)
                                                }
                                                className={`flex-shrink-0 min-w-[160px] cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border-2 ${
                                                    isSelected
                                                        ? "border-primary bg-primary/5 shadow-md"
                                                        : "hover:border-primary/50"
                                                }`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="text-center space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Badge
                                                                variant="secondary"
                                                                className="flex-1"
                                                            >
                                                                Option{" "}
                                                                {option.id}
                                                            </Badge>
                                                            {isSelected && (
                                                                <Check className="h-4 w-4 text-primary ml-2" />
                                                            )}
                                                        </div>
                                                        <div className="text-lg font-bold text-foreground">
                                                            {option.displayText}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Next Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNext}
                                disabled={
                                    currentIndex >= dateOptions.length - 5
                                }
                                className="flex-shrink-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next options</span>
                            </Button>
                        </div>

                        {/* Navigation Info */}
                        <div className="mt-6 text-sm text-muted-foreground text-center">
                            Showing options {currentIndex + 1}-
                            {Math.min(currentIndex + 5, dateOptions.length)} of{" "}
                            {dateOptions.length}+
                            {selectedOptionId && (
                                <span className="ml-2 text-primary font-medium">
                                    • Option {selectedOptionId} selected
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            {dateOptions.length === 0 && !Object.keys(errors).length && (
                <Card>
                    <CardContent className="p-8">
                        <div className="text-center space-y-2">
                            <div className="text-muted-foreground text-lg">
                                🗓️ Get Started
                            </div>
                            <p className="text-muted-foreground">
                                Select a "From" date to see infinite date
                                options.
                                {!dateRange.from &&
                                    ' The "To" date is optional - if not selected, single day options will be shown.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {Object.keys(errors).length > 0 && (
                <Card className="border-destructive/50">
                    <CardContent className="p-8">
                        <div className="text-center space-y-2">
                            <div className="text-destructive text-lg flex items-center justify-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Validation Errors
                            </div>
                            <p className="text-muted-foreground">
                                Please fix the validation errors above to see
                                date range options.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
