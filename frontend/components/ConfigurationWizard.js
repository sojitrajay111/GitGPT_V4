// ConfigurationWizard.js
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner'; // <--- UPDATED: Import toast directly from sonner

const ConfigurationWizard = ({
  isOpen,
  onClose,
  onSave,
  editingConfig
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [configItems, setConfigItems] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    if (isOpen) {
      if (editingConfig) {
        setTitle(editingConfig.title);
        setConfigItems(editingConfig.items.length > 0 ? editingConfig.items : [{ key: '', value: '' }]);
        setStep(2);
      } else {
        setTitle('');
        setConfigItems([{ key: '', value: '' }]);
        setStep(1);
      }
    }
  }, [editingConfig, isOpen]);

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim()) {
        // Use toast.error for validation errors
        toast.error("Validation Error", {
          description: "Please enter a configuration title.",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleAddConfigItem = () => {
    setConfigItems([...configItems, { key: '', value: '' }]);
  };

  const handleRemoveConfigItem = (index) => {
    if (configItems.length > 1 || (configItems.length === 1 && (configItems[0].key !== '' || configItems[0].value !== ''))) {
      setConfigItems(configItems.filter((_, i) => i !== index));
    } else {
      setConfigItems([{ key: '', value: '' }]);
    }
  };

  const handleConfigItemChange = (index, field, value) => {
    let newValue = value;
    // Auto-correct the key for Gemini/OpenAI integrations
    if (field === 'key') {
      const service = title.trim().toLowerCase();
      if ((service.includes('gemini') || service.includes('openai')) && value.toLowerCase() !== 'apikey') {
        newValue = 'apiKey';
        toast.info("For Gemini/OpenAI, the key has been auto-corrected to 'apiKey'.");
      }
    }
    const newItems = configItems.map((item, i) =>
      i === index ? { ...item, [field]: newValue } : item
    );
    setConfigItems(newItems);
  };

  const handleSave = () => {
    const validItems = configItems.filter(item => item.key.trim() && item.value.trim());

    if (validItems.length === 0) {
      // Use toast.error for validation errors
      toast.error("Validation Error", {
        description: "Please add at least one valid key-value pair.",
      });
      return;
    }

    onSave({
      title: title.trim(),
      items: validItems,
      isActive: editingConfig?.isActive ?? true
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTitle('');
    setConfigItems([{ key: '', value: '' }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Configuration Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., ChatGPT API, JIRA Settings, GitHub Config"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Enter a descriptive name for this configuration
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">
                  Add configuration key-value pairs
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddConfigItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add More
              </Button>
            </div>

            <div className="space-y-3">
              {configItems.map((item, index) => (
                <Card key={index} className="border-2 border-dashed border-border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Key</Label>
                        <Input
                          placeholder="e.g., apiKey (required for Gemini/OpenAI)"
                          value={item.key}
                          onChange={(e) => handleConfigItemChange(index, 'key', e.target.value)}
                        />
                        {(title.trim().toLowerCase().includes('gemini') || title.trim().toLowerCase().includes('openai')) && (
                          <span className="text-xs text-muted-foreground">For Gemini/OpenAI, the key must be <b>apiKey</b></span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Value</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Configuration value"
                            value={item.value}
                            onChange={(e) => handleConfigItemChange(index, 'value', e.target.value)}
                            className="flex-1"
                          />
                          {(configItems.length > 1 || (item.key.trim() || item.value.trim())) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveConfigItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  {editingConfig ? 'Update Configuration' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationWizard;