'use client';

import { useState } from 'react';
import {
  Star,
  X,
  MessageSquare,
  Calendar,
  User,
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, generateId } from '@/lib/utils';
import type { Contractor } from '@/types';

interface ContractorReview {
  id: string;
  contractorId: string;
  projectId?: string;
  reviewerName: string;
  reviewerRole: string;
  quality: number;
  punctuality: number;
  communication: number;
  price: number;
  overall: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

interface ContractorRatingProps {
  contractor: Contractor;
  onClose: () => void;
  onUpdateContractor: (contractor: Contractor) => void;
  projectId?: string;
}

interface RatingFormData {
  quality: number;
  punctuality: number;
  communication: number;
  price: number;
  comment: string;
  reviewerName: string;
  reviewerRole: string;
}

const initialRatingData: RatingFormData = {
  quality: 0,
  punctuality: 0,
  communication: 0,
  price: 0,
  comment: '',
  reviewerName: '',
  reviewerRole: ''
};

function StarRating({
  rating,
  onRatingChange,
  label,
  readonly = false
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  label: string;
  readonly?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Non valutato'}
        </span>
      </div>
    </div>
  );
}

export function ContractorRating({ contractor, onClose, onUpdateContractor, projectId }: ContractorRatingProps) {
  const [activeTab, setActiveTab] = useState<'add_review' | 'view_reviews'>('add_review');
  const [formData, setFormData] = useState<RatingFormData>(initialRatingData);

  // Get existing reviews from localStorage or initialize empty array
  const getContractorReviews = (): ContractorReview[] => {
    const reviews = localStorage.getItem('contractor_reviews');
    return reviews ? JSON.parse(reviews) : [];
  };

  const saveContractorReviews = (reviews: ContractorReview[]) => {
    localStorage.setItem('contractor_reviews', JSON.stringify(reviews));
  };

  const contractorReviews = getContractorReviews().filter(r => r.contractorId === contractor.id);

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reviewerName.trim()) {
      alert('Il nome del recensore è obbligatorio');
      return;
    }

    const overallRating = Math.round((formData.quality + formData.punctuality + formData.communication + formData.price) / 4);

    const newReview: ContractorReview = {
      id: generateId(),
      contractorId: contractor.id,
      projectId,
      reviewerName: formData.reviewerName,
      reviewerRole: formData.reviewerRole || 'Project Manager',
      quality: formData.quality,
      punctuality: formData.punctuality,
      communication: formData.communication,
      price: formData.price,
      overall: overallRating,
      comment: formData.comment,
      date: new Date().toISOString(),
      isVerified: true
    };

    // Save review
    const allReviews = getContractorReviews();
    const updatedReviews = [...allReviews, newReview];
    saveContractorReviews(updatedReviews);

    // Recalculate contractor ratings
    const contractorAllReviews = updatedReviews.filter(r => r.contractorId === contractor.id);
    const reviewCount = contractorAllReviews.length;

    if (reviewCount > 0) {
      const avgQuality = contractorAllReviews.reduce((sum, r) => sum + r.quality, 0) / reviewCount;
      const avgPunctuality = contractorAllReviews.reduce((sum, r) => sum + r.punctuality, 0) / reviewCount;
      const avgCommunication = contractorAllReviews.reduce((sum, r) => sum + r.communication, 0) / reviewCount;
      const avgPrice = contractorAllReviews.reduce((sum, r) => sum + r.price, 0) / reviewCount;
      const avgOverall = contractorAllReviews.reduce((sum, r) => sum + r.overall, 0) / reviewCount;

      const updatedContractor: Contractor = {
        ...contractor,
        rating: {
          overall: Math.round(avgOverall * 10) / 10,
          quality: Math.round(avgQuality * 10) / 10,
          punctuality: Math.round(avgPunctuality * 10) / 10,
          communication: Math.round(avgCommunication * 10) / 10,
          price: Math.round(avgPrice * 10) / 10,
          reviewsCount: reviewCount
        },
        updatedAt: new Date().toISOString()
      };

      onUpdateContractor(updatedContractor);
    }

    // Reset form
    setFormData(initialRatingData);
    setActiveTab('view_reviews');
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa recensione?')) return;

    const allReviews = getContractorReviews();
    const updatedReviews = allReviews.filter(r => r.id !== reviewId);
    saveContractorReviews(updatedReviews);

    // Recalculate ratings
    const contractorAllReviews = updatedReviews.filter(r => r.contractorId === contractor.id);
    const reviewCount = contractorAllReviews.length;

    if (reviewCount === 0) {
      // No reviews left, reset ratings
      const updatedContractor: Contractor = {
        ...contractor,
        rating: {
          overall: 0,
          quality: 0,
          punctuality: 0,
          communication: 0,
          price: 0,
          reviewsCount: 0
        },
        updatedAt: new Date().toISOString()
      };
      onUpdateContractor(updatedContractor);
    } else {
      // Recalculate averages
      const avgQuality = contractorAllReviews.reduce((sum, r) => sum + r.quality, 0) / reviewCount;
      const avgPunctuality = contractorAllReviews.reduce((sum, r) => sum + r.punctuality, 0) / reviewCount;
      const avgCommunication = contractorAllReviews.reduce((sum, r) => sum + r.communication, 0) / reviewCount;
      const avgPrice = contractorAllReviews.reduce((sum, r) => sum + r.price, 0) / reviewCount;
      const avgOverall = contractorAllReviews.reduce((sum, r) => sum + r.overall, 0) / reviewCount;

      const updatedContractor: Contractor = {
        ...contractor,
        rating: {
          overall: Math.round(avgOverall * 10) / 10,
          quality: Math.round(avgQuality * 10) / 10,
          punctuality: Math.round(avgPunctuality * 10) / 10,
          communication: Math.round(avgCommunication * 10) / 10,
          price: Math.round(avgPrice * 10) / 10,
          reviewsCount: reviewCount
        },
        updatedAt: new Date().toISOString()
      };
      onUpdateContractor(updatedContractor);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Valutazione Fornitore
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {contractor.name || contractor.companyName}
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {contractor.rating.overall.toFixed(1)} ({contractor.rating.reviewsCount} recensioni)
                </span>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'add_review', label: 'Nuova Recensione', icon: Star },
              { id: 'view_reviews', label: `Recensioni (${contractorReviews.length})`, icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'add_review' && (
            <form onSubmit={handleSubmitRating} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Recensore *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.reviewerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                    placeholder="Il tuo nome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruolo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.reviewerRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewerRole: e.target.value }))}
                    placeholder="Project Manager, Responsabile, ecc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StarRating
                  label="Qualità del Lavoro"
                  rating={formData.quality}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, quality: rating }))}
                />
                <StarRating
                  label="Puntualità"
                  rating={formData.punctuality}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, punctuality: rating }))}
                />
                <StarRating
                  label="Comunicazione"
                  rating={formData.communication}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, communication: rating }))}
                />
                <StarRating
                  label="Rapporto Qualità/Prezzo"
                  rating={formData.price}
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, price: rating }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commento (opzionale)
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Condividi la tua esperienza con questo fornitore..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button type="submit">
                  Pubblica Recensione
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'view_reviews' && (
            <div className="space-y-6">
              {contractorReviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna recensione</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sii il primo a recensire questo fornitore.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setActiveTab('add_review')}>
                      <Star className="h-4 w-4 mr-2" />
                      Scrivi Recensione
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {contractorReviews
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{review.reviewerName}</span>
                                {review.reviewerRole && (
                                  <span className="text-sm text-gray-500">({review.reviewerRole})</span>
                                )}
                                {review.isVerified && (
                                  <CheckCircle className="h-4 w-4 text-green-500" title="Recensione verificata" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(review.date)}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= review.overall
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-1">{review.overall}/5</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{review.quality}/5</div>
                            <div className="text-gray-500">Qualità</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{review.punctuality}/5</div>
                            <div className="text-gray-500">Puntualità</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{review.communication}/5</div>
                            <div className="text-gray-500">Comunicazione</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{review.price}/5</div>
                            <div className="text-gray-500">Prezzo</div>
                          </div>
                        </div>

                        {review.comment && (
                          <div className="bg-white rounded p-3 text-sm text-gray-700">
                            <MessageSquare className="h-4 w-4 inline mr-2 text-gray-400" />
                            {review.comment}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}