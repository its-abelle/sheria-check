import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Send, CheckCircle } from "lucide-react-native";
import { submitReport } from "../services/api";
import { useToast } from "./Toast";
import { LoadingSpinner } from "./LoadingSpinner";
import type { ReportPayload } from "../types";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  offenseId?: string;
}

export function ReportModal({ visible, onClose, offenseId }: ReportModalProps) {
  const [form, setForm] = useState<ReportPayload>({
    offense_id: offenseId,
    officer_name: "",
    officer_badge: "",
    location: "",
    amount_demanded: undefined,
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (visible) {
      setForm({
        offense_id: offenseId,
        officer_name: "",
        officer_badge: "",
        location: "",
        amount_demanded: undefined,
        description: "",
      });
      setSubmitted(false);
      setConfirming(false);
      setSending(false);
      setError(null);
    }
  }, [visible, offenseId]);

  const handleClose = () => {
    if (sending) return;
    if (submitted) {
      toast("Report submitted. Thank you.", "success");
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      setError("Please describe the incident.");
      return;
    }
    setConfirming(true);
  };

  const confirmSubmit = async () => {
    setConfirming(false);
    setSending(true);
    setError(null);
    try {
      await submitReport(form);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit report.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="max-h-[85%] rounded-t-3xl bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-primary-900">
              {submitted ? "Report Submitted" : "Report Incident"}
            </Text>
            <Pressable onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={22} color="#6B3A2A" />
            </Pressable>
          </View>

          {submitted ? (
            <View className="items-center py-8">
              <CheckCircle size={56} color="#16a34a" />
              <Text className="mt-4 text-center text-base text-primary-900">
                Thank you for your report. This helps protect Kenyan motorists.
              </Text>
              <Pressable onPress={handleClose} className="mt-6 rounded-xl bg-primary-500 px-6 py-3">
                <Text className="font-semibold text-white">Done</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="mb-4 text-sm text-gray-500">
                Your report is anonymous. Submit it to help track corruption patterns.
              </Text>

              <Field
                label="Officer name (optional)"
                value={form.officer_name || ""}
                onChangeText={(v) => setForm((f) => ({ ...f, officer_name: v }))}
              />
              <Field
                label="Badge number (optional)"
                value={form.officer_badge || ""}
                onChangeText={(v) => setForm((f) => ({ ...f, officer_badge: v }))}
              />
              <Field
                label="Location"
                value={form.location || ""}
                onChangeText={(v) => setForm((f) => ({ ...f, location: v }))}
              />
              <Field
                label="Amount demanded (KES)"
                value={form.amount_demanded ? String(form.amount_demanded) : ""}
                onChangeText={(v) =>
                  setForm((f) => ({
                    ...f,
                    amount_demanded: v ? Number(v) : undefined,
                  }))
                }
                keyboardType="numeric"
              />
              <Field
                label="What happened? *"
                value={form.description}
                onChangeText={(v) => {
                  setForm((f) => ({ ...f, description: v }));
                  setError(null);
                }}
                multiline
              />

              {error && (
                <Text className="mt-2 text-sm text-red-600">{error}</Text>
              )}

              {confirming ? (
                <View className="mt-4 gap-3">
                  <Text className="text-center text-sm text-gray-500">
                    Submit this report? It will be sent anonymously.
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setConfirming(false)}
                      className="flex-1 rounded-xl border border-gray-300 py-3"
                    >
                      <Text className="text-center font-semibold text-gray-600">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={confirmSubmit}
                      className="flex-1 rounded-xl bg-primary-500 py-3"
                    >
                      <Text className="text-center font-semibold text-white">Confirm</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={handleSubmit}
                  disabled={sending}
                  className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-primary-500 py-3"
                >
                  {sending ? (
                    <LoadingSpinner size={18} color="#ffffff" />
                  ) : (
                    <>
                      <Send size={16} color="#ffffff" />
                      <Text className="font-semibold text-white">Submit Report</Text>
                    </>
                  )}
                </Pressable>
              )}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-primary-700">{label}</Text>
      <TextInput
        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-primary-900"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#A87A5E"
      />
    </View>
  );
}
