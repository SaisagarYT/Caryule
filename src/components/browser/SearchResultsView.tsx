import React, { useState, useEffect } from 'react';
import {
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  Newspaper,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  ArrowUpRight,
  X,
  Share2,
} from 'lucide-react';
import type { SearchFilterTab, SearchData, ImageSearchResult } from '../../types';
import { fetchSearchResults, extractSearchQuery } from '../../services/searchEngine';
import { useBrowserStore } from '../../store/useBrowserStore';
import './SearchResultsView.css';

interface SearchResultsViewProps {
  url: string;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ url }) => {
  const query = extractSearchQuery(url);
  const { navigateActiveTab } = useBrowserStore();

  const [activeTab, setActiveTab] = useState<SearchFilterTab>('all');
  const [data, setData] = useState<SearchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Any time');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [selectedImage, setSelectedImage] = useState<ImageSearchResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchSearchResults(query).then((res) => {
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleRelatedClick = (newQuery: string) => {
    navigateActiveTab(`https://www.google.com/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleOpenRealGoogle = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  if (isLoading || !data) {
    return (
      <div className="search-loading-container" aria-label="Loading search results">
        <div className="search-loading-spinner" />
        <span className="search-loading-text">Searching Google index for "{query}"...</span>
      </div>
    );
  }

  return (
    <div className="search-results-viewport">
      {/* Google Filter Tabs Bar */}
      <div className="search-filter-bar">
        <div className="search-tabs-list" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`search-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Search size={14} strokeWidth={2.2} />
            <span>All</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'images'}
            className={`search-tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            <ImageIcon size={14} strokeWidth={2.2} />
            <span>Images</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'videos'}
            className={`search-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <VideoIcon size={14} strokeWidth={2.2} />
            <span>Videos</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'news'}
            className={`search-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <Newspaper size={14} strokeWidth={2.2} />
            <span>News</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'maps'}
            className={`search-tab-btn ${activeTab === 'maps' ? 'active' : ''}`}
            onClick={() => setActiveTab('maps')}
          >
            <MapPin size={14} strokeWidth={2.2} />
            <span>Maps</span>
          </button>

          <button
            type="button"
            className={`search-tab-btn tools-btn ${showTools ? 'active' : ''}`}
            onClick={() => setShowTools(!showTools)}
            title="Search Tools & Filters"
          >
            <SlidersHorizontal size={13} strokeWidth={2} />
            <span>Tools</span>
          </button>
        </div>

        {/* Results Stats & External Action */}
        <div className="search-bar-right-meta">
          <span className="search-stats-text">{data.stats}</span>
          <button
            type="button"
            className="search-open-external-btn"
            onClick={handleOpenRealGoogle}
            title="Open in real Google.com in new window"
          >
            <span>Google.com</span>
            <ExternalLink size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Secondary Tools Bar (When Tools is toggled) */}
      {showTools && (
        <div className="search-tools-dropdown-bar">
          <div className="search-tool-filter-group">
            <span className="search-tool-label">Time:</span>
            {['Any time', 'Past 24 hours', 'Past week', 'Past month', 'Past year'].map((t) => (
              <button
                key={t}
                type="button"
                className={`search-tool-pill ${timeFilter === t ? 'active' : ''}`}
                onClick={() => setTimeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="search-tool-filter-group">
            <span className="search-tool-label">Results:</span>
            <span className="search-tool-pill active">All results</span>
            <span className="search-tool-pill">Verbatim</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="search-content-scrollable">
        <div className="search-content-container">
          {/* TAB 1: ALL */}
          {activeTab === 'all' && (
            <div className="search-tab-all-layout">
              <div className="search-primary-column">
                {/* AI Overview Box (Signature Agentic Browser Feature) */}
                {data.aiOverview && (
                  <div className="ai-overview-card">
                    <div className="ai-overview-header">
                      <div className="ai-overview-title-row">
                        <Sparkles size={16} className="text-blue-500 animate-pulse" />
                        <span className="ai-overview-title">AI Overview</span>
                      </div>
                      <span className="ai-overview-badge">Agentic Summary</span>
                    </div>

                    <p className="ai-overview-summary">{data.aiOverview.summary}</p>

                    <div className="ai-overview-keypoints">
                      {data.aiOverview.keyPoints.map((point, idx) => (
                        <div key={idx} className="ai-overview-point">
                          <span className="ai-point-bullet">•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    <div className="ai-overview-sources">
                      <span className="ai-sources-label">Sources:</span>
                      {data.aiOverview.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ai-source-chip"
                        >
                          <span>{src.name}</span>
                          <ArrowUpRight size={11} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images Preview Strip in "All" Tab */}
                {data.images && data.images.length > 0 && (
                  <div className="search-all-images-strip">
                    <div className="search-all-images-header">
                      <div className="search-all-images-title">
                        <ImageIcon size={16} className="text-zinc-600" />
                        <span>Images for "{query}"</span>
                      </div>
                      <button
                        type="button"
                        className="search-all-images-view-all"
                        onClick={() => setActiveTab('images')}
                      >
                        <span>View all images</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                    <div className="search-all-images-row">
                      {data.images.slice(0, 6).map((img) => (
                        <div
                          key={img.id}
                          className="search-all-image-item"
                          onClick={() => setSelectedImage(img)}
                          title={img.title}
                        >
                          <div className="search-all-image-thumb-wrap">
                            <img
                              src={img.imageUrl}
                              alt={img.title}
                              className="search-all-image-thumb"
                              loading="lazy"
                              onError={(e) => {
                                const parent = (e.currentTarget.closest('.search-all-image-item') as HTMLElement);
                                if (parent) parent.style.display = 'none';
                              }}
                            />
                          </div>
                          <span className="search-all-image-label">{img.title}</span>
                          <span className="search-all-image-domain">{img.domain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* People Also Ask Accordions */}
                {data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0 && (
                  <div className="search-paa-card">
                    <h3 className="search-section-header">People also ask</h3>
                    <div className="search-paa-list">
                      {data.peopleAlsoAsk.map((item, idx) => {
                        const isOpen = expandedFaq === idx;
                        return (
                          <div key={idx} className="search-paa-item">
                            <button
                              type="button"
                              className="search-paa-question"
                              onClick={() => setExpandedFaq(isOpen ? null : idx)}
                            >
                              <span>{item.question}</span>
                              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {isOpen && (
                              <div className="search-paa-answer">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Web Results List */}
                <div className="search-web-results-list">
                  {data.results.map((res) => (
                    <article key={res.id} className="search-result-item">
                      <div className="search-result-meta">
                        <div className="search-result-favicon">
                          <Search size={11} className="text-zinc-400" />
                        </div>
                        <span className="search-result-domain">{res.displayUrl}</span>
                      </div>

                      <h2 className="search-result-title">
                        <a
                          href={res.url}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateActiveTab(res.url);
                          }}
                        >
                          {res.title}
                        </a>
                      </h2>

                      <p className="search-result-snippet">
                        {res.date && <span className="search-snippet-date">{res.date} — </span>}
                        {res.snippet}
                      </p>

                      {/* Sitelinks */}
                      {res.sitelinks && res.sitelinks.length > 0 && (
                        <div className="search-sitelinks-grid">
                          {res.sitelinks.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              className="search-sitelink"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateActiveTab(
                                  `https://www.google.com/search?q=${encodeURIComponent(
                                    `${query} ${link.title}`
                                  )}`
                                );
                              }}
                            >
                              <span className="search-sitelink-title">{link.title}</span>
                              <span className="search-sitelink-desc">
                                Jump to {link.title} section
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                {/* Related Searches Pills */}
                {data.relatedSearches && data.relatedSearches.length > 0 && (
                  <div className="search-related-card">
                    <h3 className="search-section-header">Related searches</h3>
                    <div className="search-related-grid">
                      {data.relatedSearches.map((rQuery, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="search-related-pill"
                          onClick={() => handleRelatedClick(rQuery)}
                        >
                          <Search size={13} className="text-zinc-500" />
                          <span>{rQuery}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Pagination */}
                <div className="search-pagination-row">
                  <div className="search-google-logo-pagination">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">o</span>
                    <span className="text-green-500">g</span>
                    <span className="text-red-500">l</span>
                    <span className="text-blue-500">e</span>
                  </div>
                  <div className="search-page-numbers">
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`search-page-btn ${page === 1 ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button type="button" className="search-page-btn next">
                      Next &gt;
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Column: Knowledge Card (if encyclopedic entity exists) */}
              {data.knowledgeCard && (
                <aside className="search-sidebar-column">
                  <div className="knowledge-panel-card">
                    {data.knowledgeCard.image && (
                      <div className="knowledge-card-image-wrap">
                        <img
                          src={data.knowledgeCard.image}
                          alt={data.knowledgeCard.title}
                          className="knowledge-card-image"
                        />
                      </div>
                    )}

                    <div className="knowledge-card-body">
                      <h2 className="knowledge-card-title">{data.knowledgeCard.title}</h2>
                      <span className="knowledge-card-subtitle">
                        {data.knowledgeCard.subtitle}
                      </span>

                      <p className="knowledge-card-desc">{data.knowledgeCard.description}</p>

                      <div className="knowledge-attributes-list">
                        {data.knowledgeCard.attributes.map((attr, idx) => (
                          <div key={idx} className="knowledge-attr-row">
                            <span className="knowledge-attr-label">{attr.label}</span>
                            <span className="knowledge-attr-value">{attr.value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="knowledge-card-actions">
                        <a
                          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(
                            data.knowledgeCard.title
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="knowledge-action-btn"
                        >
                          <span>Wikipedia Overview</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}

          {/* TAB 2: IMAGES */}
          {activeTab === 'images' && (
            <div className="search-images-tab">
              {/* Image Tags / Filter pills */}
              <div className="search-image-tags-row">
                {['All HD', 'Wallpapers', 'Vector', 'Minimalist', 'Aesthetic', '4K'].map(
                  (tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`search-image-tag ${idx === 0 ? 'active' : ''}`}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>

              {/* Images Grid */}
              <div className="search-images-grid">
                {data.images.map((img) => (
                  <div
                    key={img.id}
                    className="search-image-card"
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="search-image-thumb-wrap">
                      <img
                        src={img.imageUrl}
                        alt={img.title}
                        className="search-image-thumb"
                        loading="lazy"
                      />
                    </div>
                    <div className="search-image-card-info">
                      <span className="search-image-card-title">{img.title}</span>
                      <span className="search-image-card-domain">{img.domain}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS */}
          {activeTab === 'videos' && (
            <div className="search-videos-tab">
              <div className="search-videos-list">
                {data.videos.map((vid) => (
                  <article key={vid.id} className="search-video-item">
                    <div className="search-video-thumb-container">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="search-video-thumb"
                      />
                      <span className="search-video-duration">{vid.duration}</span>
                    </div>

                    <div className="search-video-details">
                      <h3 className="search-video-title">
                        <a href={vid.url} target="_blank" rel="noreferrer">
                          {vid.title}
                        </a>
                      </h3>

                      <div className="search-video-channel-row">
                        <span className="search-video-channel">{vid.channel}</span>
                        <span className="search-video-dot">•</span>
                        <span>{vid.views}</span>
                        <span className="search-video-dot">•</span>
                        <span>{vid.uploadedAt}</span>
                      </div>

                      <p className="search-video-snippet">{vid.snippet}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NEWS */}
          {activeTab === 'news' && (
            <div className="search-news-tab">
              <div className="search-news-list">
                {data.news.map((item) => (
                  <article key={item.id} className="search-news-item">
                    <div className="search-news-text">
                      <div className="search-news-source-row">
                        <span className="search-news-source">{item.source}</span>
                        <span className="search-news-time">
                          <Clock size={11} className="inline mr-1" />
                          {item.timeAgo}
                        </span>
                      </div>

                      <h3 className="search-news-title">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                      </h3>

                      <p className="search-news-snippet">{item.snippet}</p>
                    </div>

                    {item.imageUrl && (
                      <div className="search-news-image-wrap">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="search-news-image"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MAPS */}
          {activeTab === 'maps' && (
            <div className="search-maps-tab">
              <div className="search-map-card">
                <div className="search-map-mock-view">
                  <div className="search-map-pin-pulse">
                    <MapPin size={24} className="text-red-500 fill-red-500" />
                  </div>
                  <span className="search-map-location-tag">
                    {query} Region & Coordinates
                  </span>
                </div>

                <div className="search-map-info-body">
                  <h3 className="search-map-title">{query} Global Center</h3>
                  <div className="search-map-rating-row">
                    <span className="search-map-rating">4.8</span>
                    <span className="text-amber-500">★★★★★</span>
                    <span className="text-zinc-500 text-xs">(3,820 Google reviews)</span>
                  </div>
                  <p className="search-map-address">
                    1600 Amphitheatre Pkwy, Mountain View, CA 94043
                  </p>
                  <p className="search-map-status">
                    <span className="text-emerald-600 font-medium">Open now</span> · Closes
                    9:00 PM
                  </p>

                  <div className="search-map-actions-row">
                    <button type="button" className="search-map-action-btn primary">
                      <MapPin size={13} />
                      <span>Directions</span>
                    </button>
                    <button type="button" className="search-map-action-btn">
                      <Share2 size={13} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="search-image-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div
            className="search-image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-image-modal-header">
              <span className="search-image-modal-title">{selectedImage.title}</span>
              <button
                type="button"
                className="search-image-modal-close"
                onClick={() => setSelectedImage(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="search-image-modal-preview">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="search-image-modal-img"
              />
            </div>
            <div className="search-image-modal-footer">
              <span className="text-zinc-500 text-xs">
                Domain: {selectedImage.domain} · {selectedImage.dimensions || 'High Resolution'}
              </span>
              <a
                href={selectedImage.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="search-image-modal-visit-btn"
              >
                <span>Visit Page</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;

