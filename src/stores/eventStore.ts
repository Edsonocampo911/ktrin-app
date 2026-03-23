import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export type EventStatus = "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type EventType = "corporate" | "social" | "wedding" | "birthday" | "graduation" | "other";

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  expected_guests: number;
  status: EventStatus;
  budget_estimate: number | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  title: string;
  description: string;
  event_type: EventType;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  expected_guests: number;
  budget_estimate: number | null;
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  
  // Actions
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  createEvent: (data: EventFormData) => Promise<Event | null>;
  updateEvent: (id: string, data: Partial<EventFormData>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,

  setEvents: (events) => set({ events }),
  
  setCurrentEvent: (event) => set({ currentEvent: event }),
  
  setLoading: (isLoading) => set({ isLoading }),

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ events: [], isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        toast.error("Error al cargar eventos");
        set({ events: [], isLoading: false });
        return;
      }

      set({ events: data as Event[], isLoading: false });
    } catch (error) {
      console.error("Unexpected error fetching events:", error);
      set({ events: [], isLoading: false });
    }
  },

  fetchEventById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        return null;
      }

      const event = data as Event;
      set({ currentEvent: event });
      return event;
    } catch (error) {
      console.error("Unexpected error fetching event:", error);
      return null;
    }
  },

  createEvent: async (data: EventFormData) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión");
        set({ isLoading: false });
        return null;
      }

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          organizer_id: user.id,
          ...data,
          status: "DRAFT",
        } as any)
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        toast.error("Error al crear el evento");
        set({ isLoading: false });
        return null;
      }

      toast.success("Evento creado exitosamente");
      
      // Update events list
      const { events } = get();
      set({ 
        events: [event as Event, ...events],
        currentEvent: event as Event,
        isLoading: false 
      });
      
      return event as Event;
    } catch (error) {
      console.error("Unexpected error creating event:", error);
      toast.error("Error al crear el evento");
      set({ isLoading: false });
      return null;
    }
  },

  updateEvent: async (id: string, data: Partial<EventFormData>) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from("events")
        .update(data)
        .eq("id", id);

      if (error) {
        console.error("Error updating event:", error);
        toast.error("Error al actualizar el evento");
        set({ isLoading: false });
        return false;
      }

      toast.success("Evento actualizado");
      
      // Refresh events list
      await get().fetchEvents();
      
      // Update current event if it's the same
      const { currentEvent } = get();
      if (currentEvent?.id === id) {
        await get().fetchEventById(id);
      }
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Unexpected error updating event:", error);
      toast.error("Error al actualizar el evento");
      set({ isLoading: false });
      return false;
    }
  },

  deleteEvent: async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting event:", error);
        toast.error("Error al eliminar el evento");
        return false;
      }

      toast.success("Evento eliminado");
      
      // Update events list
      const { events } = get();
      set({ 
        events: events.filter(e => e.id !== id),
        currentEvent: get().currentEvent?.id === id ? null : get().currentEvent
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error deleting event:", error);
      toast.error("Error al eliminar el evento");
      return false;
    }
  },
}));

