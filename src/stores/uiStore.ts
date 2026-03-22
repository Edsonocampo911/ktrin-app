import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode | null;
  openModal: (title: string, content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: "",
  content: null,
  openModal: (title, content) => set({ isOpen: true, title, content }),
  closeModal: () => set({ isOpen: false, title: "", content: null }),
}));

interface ToastState {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  type: "info",
  isVisible: false,
  showToast: (message, type = "info") => set({ message, type, isVisible: true }),
  hideToast: () => set({ isVisible: false }),
}));

interface WizardState {
  currentStep: number;
  totalSteps: number;
  formData: Record<string, any>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFormData: (data: Record<string, any>) => void;
  updateFormData: (key: string, value: any) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: 1,
  totalSteps: 4,
  formData: {},
  
  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  setFormData: (data) => set({ formData: data }),
  
  updateFormData: (key, value) => set((state) => ({
    formData: { ...state.formData, [key]: value }
  })),
  
  reset: () => set({ currentStep: 1, formData: {} }),
}));

