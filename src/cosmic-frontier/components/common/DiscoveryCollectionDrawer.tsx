/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Personal Discovery Collection & Bookmarks Drawer
 */

import React, { useState, useEffect } from 'react';
import type { SolarSystemObject } from '../../types';
import { SOLAR_SYSTEM_OBJECTS } from '../../data/solarSystemData';
import {
  Bookmark,
  X,
  Trash2,
  ExternalLink,
  Download,
  Orbit,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface DiscoveryCollectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject: (objectId: string) => void;
  bookmarkedIds: string[];
  onRemoveBookmark: (id: string) => void;
}

export const DiscoveryCollectionDrawer: React.FC<DiscoveryCollectionDrawerProps> = ({
  isOpen,
  onClose,
  onSelectObject,
  bookmarkedIds,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  const bookmarkedObjects = SOLAR_SYSTEM_OBJECTS.filter((o) => bookmarkedIds.includes(o.id));

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarkedObjects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'black-star-orbit-collection.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#070D1E]/95 border-l border-[#38BDF8]/30 shadow-2xl h-full flex flex-col electric-border-active"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0B1630] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 border border-[#F5C451]/30 flex items-center justify-center text-[#F5C451]">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-mono text-[#F8FAFC]">
                Personal Discovery Collection
              </h3>
              <p className="text-[10px] text-[#94A3B8] font-mono">
                {bookmarkedObjects.length} Bookmarked Celestial Bodies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedObjects.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <Bookmark className="w-10 h-10 text-[#64748B] mx-auto stroke-1" />
              <h4 className="text-sm font-semibold text-[#F8FAFC] font-mono">
                Your Collection is Empty
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Click the bookmark icon on any celestial object inspector or candidate card to save discoveries to your personal research catalog.
              </p>
            </div>
          ) : (
            bookmarkedObjects.map((obj) => (
              <div
                key={obj.id}
                className="p-3.5 rounded-2xl bg-[#0B1630]/80 border border-white/10 hover:border-[#38BDF8]/50 transition group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border text-xs"
                      style={{
                        backgroundColor: `${obj.color}15`,
                        borderColor: `${obj.color}40`,
                        color: obj.color,
                      }}
                    >
                      <Orbit className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F8FAFC] font-mono group-hover:text-[#38BDF8] transition-colors">
                        {obj.name}
                      </h4>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {obj.type} • {obj.semiMajorAxisAU} AU
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveBookmark(obj.id)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition"
                    title="Remove from collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-[#A7B4CC] line-clamp-2">
                  {obj.description}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => {
                      onSelectObject(obj.id);
                      onClose();
                    }}
                    className="text-[#38BDF8] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect Target</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-[#64748B]">{obj.statusLabel}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {bookmarkedObjects.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#0B1630] flex items-center justify-between">
            <button
              onClick={exportJSON}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Export Collection (JSON)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
