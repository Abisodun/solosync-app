import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Clock, Target, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIPublishingTips({ contentItem }) {
  const [tips, setTips] = useState(contentItem.ai_content_tips || []);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentItem.update(contentItem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    }
  });

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const prompt = `You are a content marketing expert. Analyze this content and provide recommendations:

Content Type: ${contentItem.type}
Channel: ${contentItem.channel}
Title: ${contentItem.title}
Description: ${contentItem.description || 'No description'}
Current Status: ${contentItem.status}

Provide a JSON response with:
{
  "optimal_time": "Best time to publish (e.g., 'Tuesday at 2 PM')",
  "engagement_prediction": "high, medium, or low",
  "recommendation_score": number between 1-100,
  "tips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "reasoning": "Brief explanation of why this timing"
}

Base recommendations on platform best practices for ${contentItem.channel}.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            optimal_time: { type: 'string' },
            engagement_prediction: { type: 'string' },
            recommendation_score: { type: 'number' },
            tips: {
              type: 'array',
              items: { type: 'string' }
            },
            reasoning: { type: 'string' }
          }
        }
      });

      setRecommendation(response);
      setTips(response.tips || []);

      // Update content item with AI recommendations
      await updateMutation.mutateAsync({
        ai_content_tips: response.tips,
        ai_recommendation_score: response.recommendation_score,
        engagement_prediction: response.engagement_prediction
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
    setLoading(false);
  };

  const engagementColors = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-red-100 text-red-700'
  };

  return (
    <Card className="p-6 rounded-[20px] mt-6" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">AI Publishing Recommendations</h3>
            <p className="text-xs text-gray-600">Optimize for maximum engagement</p>
          </div>
        </div>

        {!recommendation && (
          <Button
            onClick={generateRecommendations}
            disabled={loading}
            className="rounded-[12px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Recommendations
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Score & Prediction */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-[14px] border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-gray-600">Recommendation Score</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {recommendation.recommendation_score}/100
                </div>
              </div>

              <div className="p-4 bg-white rounded-[14px] border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-gray-600">Engagement Prediction</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-[8px] text-sm font-bold ${engagementColors[recommendation.engagement_prediction]}`}>
                  {recommendation.engagement_prediction.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Optimal Time */}
            <div className="p-4 bg-white rounded-[14px] border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Optimal Publishing Time</span>
              </div>
              <p className="text-lg font-bold text-blue-600">{recommendation.optimal_time}</p>
              <p className="text-sm text-gray-600 mt-2">{recommendation.reasoning}</p>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Content Optimization Tips</h4>
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-[12px] border border-purple-50 flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
                  >
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{tip}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={generateRecommendations}
              variant="outline"
              className="w-full rounded-[12px]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Recommendations
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}