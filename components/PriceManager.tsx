import React, { useState, useEffect } from 'react';
import { usePriceStore } from '../stores/usePriceStore';
import { usePriceManager } from '../hooks/usePriceActions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Loader2, Clock, TrendingUp, History, CheckCircle, XCircle } from 'lucide-react';
import { priceApi } from '../lib/api/priceApi';

const PriceManager: React.FC = () => {
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showJobs, setShowJobs] = useState(false);

  const {
    token,
    network,
    timestamp,
    price,
    source,
    loading,
    error,
    success,
    setToken,
    setNetwork,
    setTimestamp,
    resetAll,
  } = usePriceStore();

  const {
    handleGetPrice,
    handleSchedule,
    canFetchPrice,
    canSchedule,
    isScheduling,
    scheduleProgress,
    cancelSchedule,
  } = usePriceManager();

  const handleScheduleHistory = async () => {
    if (!token || !network) return;

    try {
      await handleSchedule();
      // Refresh jobs list after scheduling
      fetchScheduledJobs();
    } catch (error) {
      console.error('Failed to schedule full history:', error);
    }
  };

  const fetchScheduledJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await priceApi.getScheduledJobs();
      setScheduledJobs(response.jobs || []);
    } catch (error) {
      console.error('Failed to fetch scheduled jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  // Fetch jobs on component mount
  useEffect(() => {
    fetchScheduledJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Header */}
        <div className="text-center py-8">
          <div className="relative">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Token Price Oracle
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 blur-3xl -z-10"></div>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real-time blockchain price data with advanced interpolation and historical analysis
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">System Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Input Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-700/50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Price Discovery
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">

                {/* Token Input */}
                <div className="space-y-3">
                  <Label htmlFor="token" className="text-lg font-medium text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Token Contract Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="token"
                      type="text"
                      placeholder="0xA0b869...c2d6 (USDC) or ETH for native"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-gray-100 placeholder-gray-400 h-12 pl-4 pr-12 rounded-xl transition-all duration-300 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 group-hover:border-gray-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">T</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    Enter contract address (0x...) or token symbol (ETH, BTC)
                  </div>
                </div>

                {/* Network Selector */}
                <div className="space-y-3">
                  <Label htmlFor="network" className="text-lg font-medium text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Network
                  </Label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 text-gray-100 h-12 px-4 rounded-xl transition-all duration-300 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 hover:border-gray-500/50"
                  >
                    <option value="ethereum">🔷 Ethereum</option>
                    <option value="polygon">🟣 Polygon</option>
                    <option value="arbitrum">🔵 Arbitrum</option>
                    <option value="optimism">🔴 Optimism</option>
                  </select>
                </div>

                {/* Timestamp */}
                <div className="space-y-3">
                  <Label htmlFor="timestamp" className="text-lg font-medium text-gray-200 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${timestamp ? 'bg-purple-400' : 'bg-cyan-400'}`}></div>
                    Timestamp (Optional)
                    {timestamp && (
                      <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                        Historical Mode
                      </span>
                    )}
                  </Label>
                  <div className="relative group">
                    <Input
                      id="timestamp"
                      type="datetime-local"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      className={`bg-gray-800/50 border-gray-600/50 text-gray-100 h-12 px-4 rounded-xl transition-all duration-300 focus:ring-2 group-hover:border-gray-500/50 ${timestamp
                        ? 'border-purple-500/50 focus:border-purple-500/50 focus:ring-purple-500/20'
                        : 'border-gray-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                        }`}
                      placeholder="Leave empty for current time"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      {timestamp
                        ? 'Historical price will be fetched for the selected date/time'
                        : 'Leave empty to use current time, or select a specific date/time'
                      }
                    </div>
                    {timestamp && (
                      <div className="text-xs bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <History className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-300 font-medium">Historical Request Preview</span>
                        </div>
                        <div className="text-purple-200">
                          Date: {new Date(timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-purple-200">
                          Time: {new Date(timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          ISO: {new Date(timestamp).toISOString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-6">
                  <Button
                    onClick={handleGetPrice}
                    disabled={!canFetchPrice || loading}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        Fetching Price...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 mr-3" />
                        Get Price
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleScheduleHistory}
                    disabled={!canFetchPrice || loading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
                  >
                    <History className="h-5 w-5 mr-3" />
                    Schedule Full History
                  </Button>

                  <Button
                    onClick={resetAll}
                    variant="secondary"
                    className="w-full h-10 border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50 rounded-xl transition-all duration-300"
                  >
                    Reset All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-b border-gray-700/50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {timestamp ? 'Historical Results' : 'Live Results'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {error && (
                  <Alert className="border-red-500/50 bg-red-900/20">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {success && price !== null && source && (
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/50 rounded-xl p-6 space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        ${price}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {timestamp ? 'Historical Price' : 'Current Price'}
                      </div>
                      {timestamp && (
                        <div className="text-xs text-cyan-400 mt-1">
                          {new Date(timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Source</div>
                        <div className="text-white font-mono bg-gray-800/50 px-2 py-1 rounded text-xs">{source}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Token</div>
                        <div className="text-white font-mono bg-gray-800/50 px-2 py-1 rounded text-xs">{token}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Network</div>
                        <div className="text-white font-mono bg-gray-800/50 px-2 py-1 rounded text-xs">{network}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Type</div>
                        <div className={`font-mono px-2 py-1 rounded text-xs ${timestamp ? 'bg-purple-800/50 text-purple-200' : 'bg-green-800/50 text-green-200'
                          }`}>
                          {timestamp ? 'Historical' : 'Live'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center gap-4 text-gray-400 py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <div className="text-center">
                      <div className="font-medium">Fetching price data...</div>
                      <div className="text-sm text-gray-500">This may take a few seconds</div>
                    </div>
                  </div>
                )}

                {!loading && !error && !success && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-gray-400">
                      Enter token information and click "Get Price" to fetch data
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling Panel */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-b border-gray-700/50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Job Scheduler
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleSchedule}
                    disabled={!canSchedule || isScheduling}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-xl"
                  >
                    {isScheduling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Job
                      </>
                    )}
                  </Button>

                  {isScheduling && (
                    <Button
                      onClick={cancelSchedule}
                      variant="secondary"
                      className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {isScheduling && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progress:</span>
                      <span>{scheduleProgress}%</span>
                    </div>
                    <Progress
                      value={scheduleProgress}
                      className="h-2 bg-gray-800"
                    />
                  </div>
                )}

                <div className="text-sm text-gray-400 bg-gray-800/30 p-4 rounded-xl">
                  <div className="font-medium text-purple-300 mb-2">What this does:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Creates a background job to fetch historical prices</li>
                    <li>• Downloads price data from token creation to now</li>
                    <li>• Saves all historical data to database</li>
                    <li>• Runs automatically in the background</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="text-xs">
                      Token: <span className="text-blue-400 font-mono">{token || 'Select a token'}</span>
                    </div>
                    <div className="text-xs">
                      Network: <span className="text-purple-400 font-mono">{network || 'Select a network'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Jobs Viewer */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-b border-gray-700/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      Scheduled Jobs
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowJobs(!showJobs)}
                    variant="secondary"
                    className="text-xs"
                  >
                    {showJobs ? 'Hide' : 'Show'} Jobs
                  </Button>
                </CardTitle>
              </CardHeader>
              {showJobs && (
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Total Jobs: <span className="text-white font-mono">{scheduledJobs.length}</span>
                    </div>
                    <Button
                      onClick={fetchScheduledJobs}
                      disabled={jobsLoading}
                      variant="secondary"
                      className="text-xs"
                    >
                      {jobsLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Refreshing...
                        </>
                      ) : (
                        'Refresh'
                      )}
                    </Button>
                  </div>

                  {scheduledJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-gray-400 mb-2">No scheduled jobs yet</div>
                      <div className="text-xs text-gray-500">
                        Schedule a job above to see it here
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scheduledJobs.map((job, index) => (
                        <div
                          key={job.id || index}
                          className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${job.enabled ? 'bg-green-400' : 'bg-red-400'
                                }`}></div>
                              <span className="font-mono text-sm text-white">
                                {job.token?.toUpperCase() || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-400">on</span>
                              <span className="font-mono text-sm text-purple-300">
                                {job.network || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {job.enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                              <span className="text-xs text-gray-400">
                                {job.enabled ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="text-gray-400">Created</div>
                              <div className="text-white font-mono">
                                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown'}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Last Run</div>
                              <div className="text-white font-mono">
                                {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : 'Never'}
                              </div>
                            </div>
                          </div>
                          {job.id && (
                            <div className="mt-2 pt-2 border-t border-gray-700/50">
                              <div className="text-xs text-gray-400">Job ID:</div>
                              <div className="text-xs font-mono text-gray-300 break-all">
                                {job.id}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceManager;
